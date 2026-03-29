using ExamGuard.Core.DTOs.Auth;
using ExamGuard.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUser;

    public AuthController(IAuthService authService, ICurrentUserService currentUser)
    {
        _authService = authService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Login with email and password → receive JWT + refresh token.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email và mật khẩu không được để trống." });

        var result = await _authService.LoginAsync(request, GetIpAddress());
        return Ok(result);
    }

    /// <summary>
    /// Refresh access token using a valid refresh token.
    /// Old refresh token is rotated (revoked + replaced).
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest(new { message = "Refresh token không được để trống." });

        var result = await _authService.RefreshTokenAsync(request.RefreshToken, GetIpAddress());
        return Ok(result);
    }

    /// <summary>
    /// Get current authenticated user's profile.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserInfo>> GetCurrentUser()
    {
        var user = await _authService.GetCurrentUserAsync(_currentUser.UserId);
        return Ok(user);
    }

    /// <summary>
    /// Change password for the current authenticated user.
    /// Revokes all refresh tokens after password change.
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { message = "Mật khẩu hiện tại và mật khẩu mới không được để trống." });

        await _authService.ChangePasswordAsync(_currentUser.UserId, request);
        return Ok(new { message = "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
    }

    /// <summary>
    /// Logout — revoke the provided refresh token.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest(new { message = "Refresh token không được để trống." });

        await _authService.RevokeTokenAsync(request.RefreshToken, GetIpAddress());
        return Ok(new { message = "Đăng xuất thành công." });
    }

    // ─── Helper ───
    private string? GetIpAddress()
    {
        // Check for forwarded IP first (reverse proxy)
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"].FirstOrDefault();

        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
    }
}
