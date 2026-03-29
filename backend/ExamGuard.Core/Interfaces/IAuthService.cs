using ExamGuard.Core.DTOs.Auth;

namespace ExamGuard.Core.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, string? ipAddress);
    Task<LoginResponse> RefreshTokenAsync(string refreshToken, string? ipAddress);
    Task RevokeTokenAsync(string refreshToken, string? ipAddress);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    Task<UserInfo> GetCurrentUserAsync(Guid userId);
}
