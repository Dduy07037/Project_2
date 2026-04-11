using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ExamGuard.Core.DTOs.Auth;
using ExamGuard.Core.Entities;
using ExamGuard.Core.Enums;
using ExamGuard.Core.Exceptions;
using ExamGuard.Core.Interfaces;
using ExamGuard.Core.Security;
using ExamGuard.Data;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace ExamGuard.Service.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext db, IConfiguration config, ILogger<AuthService> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            if (user != null)
            {
                user.FailedLoginCount++;

                var maxAttempts = await GetSettingIntAsync("MaxLoginAttempts", 5);
                if (user.FailedLoginCount >= maxAttempts)
                {
                    user.Status = UserStatus.Locked;
                    _logger.LogWarning("User {Email} locked after {Count} failed login attempts.", user.Email, user.FailedLoginCount);
                }

                await _db.SaveChangesAsync();
            }

            throw new UnauthorizedException("Invalid email or password.");
        }

        if (user.Status == UserStatus.Disabled)
            throw new UnauthorizedException("This account is disabled.");

        if (user.Status == UserStatus.Locked)
            throw new UnauthorizedException("This account is locked.");

        user.FailedLoginCount = 0;
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await GenerateAuthResponse(user, ipAddress, userAgent);
    }

    public async Task<LoginResponse> RefreshTokenAsync(string refreshToken, string? ipAddress, string? userAgent)
    {
        var tokenHash = ComputeTokenHash(refreshToken);
        var storedToken = await _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.TokenHash == tokenHash);

        if (storedToken == null)
            throw new UnauthorizedException("Invalid refresh token.");

        if (storedToken.IsRevoked)
        {
            _logger.LogWarning("Detected refresh token reuse for user {UserId}.", storedToken.UserId);
            await RevokeAllTokensForUser(storedToken.UserId, ipAddress, "Refresh token reuse detected");
            throw new UnauthorizedException("Refresh token has already been revoked.");
        }

        if (storedToken.IsExpired)
            throw new UnauthorizedException("Refresh token has expired.");

        if (storedToken.User.Status != UserStatus.Active)
            throw new UnauthorizedException("Account is not active.");

        storedToken.LastUsedAt = DateTime.UtcNow;
        storedToken.LastUsedByIp = ipAddress;
        storedToken.LastUsedByUserAgent = userAgent;

        var rotatedToken = CreateRefreshToken(storedToken.UserId, storedToken.SessionId, ipAddress, userAgent);
        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.RevokedByIp = ipAddress;
        storedToken.RevocationReason = "Rotated";
        storedToken.ReplacedByTokenHash = rotatedToken.Entity.TokenHash;

        _db.RefreshTokens.Add(rotatedToken.Entity);
        await _db.SaveChangesAsync();

        var accessToken = GenerateAccessToken(storedToken.User, storedToken.SessionId);
        var activeSessionCount = await GetActiveSessionCountAsync(storedToken.UserId);

        return new LoginResponse
        {
            AccessToken = accessToken.Token,
            AccessTokenExpires = accessToken.Expires,
            RefreshToken = rotatedToken.RawToken,
            RefreshTokenExpires = rotatedToken.Entity.ExpiresAt,
            SessionId = storedToken.SessionId,
            ActiveSessionCount = activeSessionCount,
            ConcurrentSessionDetected = activeSessionCount > 1,
            User = MapToUserInfo(storedToken.User)
        };
    }

    public async Task RevokeTokenAsync(Guid userId, string refreshToken, string? ipAddress, string? userAgent)
    {
        var tokenHash = ComputeTokenHash(refreshToken);
        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(r => r.TokenHash == tokenHash && r.UserId == userId);

        if (storedToken == null || !storedToken.IsActive)
            throw new UnauthorizedException("Invalid refresh token.");

        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.RevokedByIp = ipAddress;
        storedToken.RevocationReason = "Logout";
        storedToken.LastUsedAt = DateTime.UtcNow;
        storedToken.LastUsedByIp = ipAddress;
        storedToken.LastUsedByUserAgent = userAgent;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Refresh token revoked for user {UserId}.", storedToken.UserId);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("User", userId);

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            throw new AppException("Current password is incorrect.");

        if (request.NewPassword.Length < 6)
            throw new AppException("New password must be at least 6 characters.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await RevokeAllTokensForUser(userId, null, "Password changed");

        _logger.LogInformation("Password changed for user {UserId}.", userId);
    }

    public async Task<UserInfo> GetCurrentUserAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("User", userId);

        return MapToUserInfo(user);
    }

    private async Task<LoginResponse> GenerateAuthResponse(User user, string? ipAddress, string? userAgent)
    {
        var refreshToken = CreateRefreshToken(user.Id, Guid.NewGuid(), ipAddress, userAgent);
        var accessToken = GenerateAccessToken(user, refreshToken.Entity.SessionId);

        _db.RefreshTokens.Add(refreshToken.Entity);
        await _db.SaveChangesAsync();

        var activeSessionCount = await GetActiveSessionCountAsync(user.Id);
        if (activeSessionCount > 1)
        {
            _logger.LogWarning(
                "Concurrent authenticated sessions detected for user {UserId}. Active sessions: {Count}",
                user.Id,
                activeSessionCount);
        }

        return new LoginResponse
        {
            AccessToken = accessToken.Token,
            AccessTokenExpires = accessToken.Expires,
            RefreshToken = refreshToken.RawToken,
            RefreshTokenExpires = refreshToken.Entity.ExpiresAt,
            SessionId = refreshToken.Entity.SessionId,
            ActiveSessionCount = activeSessionCount,
            ConcurrentSessionDetected = activeSessionCount > 1,
            User = MapToUserInfo(user)
        };
    }

    private (string Token, DateTime Expires) GenerateAccessToken(User user, Guid sessionId)
    {
        var secret = _config["JwtSettings:Secret"]!;
        var issuer = _config["JwtSettings:Issuer"]!;
        var audience = _config["JwtSettings:Audience"]!;
        var expirationMinutes = int.Parse(_config["JwtSettings:AccessTokenExpirationMinutes"] ?? "15");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(AppClaimTypes.UserId, user.Id.ToString()),
            new(ClaimTypes.Sid, sessionId.ToString()),
            new(AppClaimTypes.SessionId, sessionId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }

    private (RefreshToken Entity, string RawToken) CreateRefreshToken(Guid userId, Guid sessionId, string? ipAddress, string? userAgent)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        var rawToken = WebEncoders.Base64UrlEncode(randomBytes);
        var expiresAt = DateTime.UtcNow.AddDays(int.Parse(_config["JwtSettings:RefreshTokenExpirationDays"] ?? "7"));

        return (new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SessionId = sessionId,
            TokenHash = ComputeTokenHash(rawToken),
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress,
            CreatedByUserAgent = userAgent,
            LastUsedAt = DateTime.UtcNow,
            LastUsedByIp = ipAddress,
            LastUsedByUserAgent = userAgent
        }, rawToken);
    }

    private async Task RevokeAllTokensForUser(Guid userId, string? ipAddress, string reason)
    {
        var activeTokens = await _db.RefreshTokens
            .Where(r => r.UserId == userId && r.RevokedAt == null && r.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;
            token.RevocationReason = reason;
        }

        if (activeTokens.Count > 0)
        {
            await _db.SaveChangesAsync();
            _logger.LogInformation("Revoked {Count} refresh tokens for user {UserId}. Reason: {Reason}", activeTokens.Count, userId, reason);
        }
    }

    private static UserInfo MapToUserInfo(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        Role = user.Role.ToString(),
        StudentCode = user.StudentCode,
        Department = user.Department
    };

    private async Task<int> GetSettingIntAsync(string key, int defaultValue)
    {
        var setting = await _db.SystemSettings.FindAsync(key);
        return setting != null && int.TryParse(setting.Value, out var value) ? value : defaultValue;
    }

    private async Task<int> GetActiveSessionCountAsync(Guid userId)
    {
        return await _db.RefreshTokens
            .Where(r => r.UserId == userId && r.RevokedAt == null && r.ExpiresAt > DateTime.UtcNow)
            .Select(r => r.SessionId)
            .Distinct()
            .CountAsync();
    }

    private static string ComputeTokenHash(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
