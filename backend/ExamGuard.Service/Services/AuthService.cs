using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ExamGuard.Core.DTOs.Auth;
using ExamGuard.Core.Entities;
using ExamGuard.Core.Enums;
using ExamGuard.Core.Exceptions;
using ExamGuard.Core.Interfaces;
using ExamGuard.Data;
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

    // ═══════════════════════════════════════════════
    //  LOGIN
    // ═══════════════════════════════════════════════
    public async Task<LoginResponse> LoginAsync(LoginRequest request, string? ipAddress)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            // Increment failed login counter if user exists
            if (user != null)
            {
                user.FailedLoginCount++;

                // Lock after N failed attempts (read from system settings)
                var maxAttempts = await GetSettingIntAsync("MaxLoginAttempts", 5);
                if (user.FailedLoginCount >= maxAttempts)
                {
                    user.Status = UserStatus.Locked;
                    _logger.LogWarning("User {Email} locked after {Count} failed login attempts.", user.Email, user.FailedLoginCount);
                }

                await _db.SaveChangesAsync();
            }

            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác.");
        }

        // Check account status
        if (user.Status == UserStatus.Disabled)
            throw new UnauthorizedException("Tài khoản đã bị vô hiệu hóa.");
        if (user.Status == UserStatus.Locked)
            throw new UnauthorizedException("Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần.");

        // Reset failed login count on success
        user.FailedLoginCount = 0;
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await GenerateAuthResponse(user, ipAddress);
    }

    // ═══════════════════════════════════════════════
    //  REFRESH TOKEN
    // ═══════════════════════════════════════════════
    public async Task<LoginResponse> RefreshTokenAsync(string refreshToken, string? ipAddress)
    {
        var storedToken = await _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken);

        if (storedToken == null)
            throw new UnauthorizedException("Refresh token không hợp lệ.");

        // Detect token reuse attack: if token was already revoked, revoke all descendant tokens
        if (storedToken.IsRevoked)
        {
            _logger.LogWarning("Detected reuse of revoked refresh token for user {UserId}. Revoking all tokens.", storedToken.UserId);
            await RevokeAllTokensForUser(storedToken.UserId, ipAddress, "Reuse of revoked token detected");
            throw new UnauthorizedException("Token đã bị thu hồi. Vui lòng đăng nhập lại.");
        }

        if (storedToken.IsExpired)
            throw new UnauthorizedException("Refresh token đã hết hạn.");

        if (storedToken.User.Status != UserStatus.Active)
            throw new UnauthorizedException("Tài khoản không khả dụng.");

        // Rotate: revoke current, create new
        var newRefreshToken = GenerateRefreshToken(storedToken.UserId, ipAddress);
        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.RevokedByIp = ipAddress;
        storedToken.ReplacedByToken = newRefreshToken.Token;

        _db.RefreshTokens.Add(newRefreshToken);
        await _db.SaveChangesAsync();

        var accessToken = GenerateAccessToken(storedToken.User);

        return new LoginResponse
        {
            AccessToken = accessToken.Token,
            AccessTokenExpires = accessToken.Expires,
            RefreshToken = newRefreshToken.Token,
            User = MapToUserInfo(storedToken.User)
        };
    }

    // ═══════════════════════════════════════════════
    //  REVOKE (LOGOUT)
    // ═══════════════════════════════════════════════
    public async Task RevokeTokenAsync(string refreshToken, string? ipAddress)
    {
        var storedToken = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken);

        if (storedToken == null || !storedToken.IsActive)
            throw new UnauthorizedException("Refresh token không hợp lệ.");

        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.RevokedByIp = ipAddress;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Refresh token revoked for user {UserId} from IP {Ip}.", storedToken.UserId, ipAddress);
    }

    // ═══════════════════════════════════════════════
    //  CHANGE PASSWORD
    // ═══════════════════════════════════════════════
    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("User", userId);

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            throw new AppException("Mật khẩu hiện tại không chính xác.");

        if (request.NewPassword.Length < 6)
            throw new AppException("Mật khẩu mới phải có ít nhất 6 ký tự.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        // Revoke all refresh tokens after password change (security)
        await RevokeAllTokensForUser(userId, null, "Password changed");

        _logger.LogInformation("Password changed for user {UserId}.", userId);
    }

    // ═══════════════════════════════════════════════
    //  GET CURRENT USER
    // ═══════════════════════════════════════════════
    public async Task<UserInfo> GetCurrentUserAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("User", userId);

        return MapToUserInfo(user);
    }

    // ═══════════════════════════════════════════════
    //  PRIVATE: Token Generation
    // ═══════════════════════════════════════════════

    private async Task<LoginResponse> GenerateAuthResponse(User user, string? ipAddress)
    {
        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken(user.Id, ipAddress);

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();

        return new LoginResponse
        {
            AccessToken = accessToken.Token,
            AccessTokenExpires = accessToken.Expires,
            RefreshToken = refreshToken.Token,
            User = MapToUserInfo(user)
        };
    }

    private (string Token, DateTime Expires) GenerateAccessToken(User user)
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
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("userId", user.Id.ToString()),
            new("role", user.Role.ToString())
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

    private static RefreshToken GenerateRefreshToken(Guid userId, string? ipAddress)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = Convert.ToBase64String(randomBytes),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };
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
        }

        if (activeTokens.Count > 0)
        {
            await _db.SaveChangesAsync();
            _logger.LogInformation("Revoked {Count} active refresh tokens for user {UserId}. Reason: {Reason}",
                activeTokens.Count, userId, reason);
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
        return setting != null && int.TryParse(setting.Value, out var val) ? val : defaultValue;
    }
}
