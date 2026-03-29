namespace ExamGuard.Core.DTOs.Auth;

// ─── Login ───
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpires { get; set; }
    public UserInfo User { get; set; } = null!;
}

// ─── Current User ───
public class UserInfo
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? StudentCode { get; set; }
    public string? Department { get; set; }
    public string? Avatar { get; set; }
}

// ─── Refresh Token ───
public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

// ─── Logout ───
public class LogoutRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

// ─── Change Password ───
public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
