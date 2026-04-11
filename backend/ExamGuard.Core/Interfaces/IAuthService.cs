using ExamGuard.Core.DTOs.Auth;

namespace ExamGuard.Core.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent);
    Task<LoginResponse> RefreshTokenAsync(string refreshToken, string? ipAddress, string? userAgent);
    Task RevokeTokenAsync(Guid userId, string refreshToken, string? ipAddress, string? userAgent);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    Task<UserInfo> GetCurrentUserAsync(Guid userId);
}
