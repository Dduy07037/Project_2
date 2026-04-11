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

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required." });

        var result = await _authService.LoginAsync(request, GetIpAddress(), GetUserAgent());
        return Ok(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest(new { message = "Refresh token is required." });

        var result = await _authService.RefreshTokenAsync(request.RefreshToken, GetIpAddress(), GetUserAgent());
        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserInfo>> GetCurrentUser()
    {
        var user = await _authService.GetCurrentUserAsync(_currentUser.UserId);
        return Ok(user);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { message = "Current password and new password are required." });

        await _authService.ChangePasswordAsync(_currentUser.UserId, request);
        return Ok(new { message = "Password changed successfully. Please sign in again." });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest(new { message = "Refresh token is required." });

        await _authService.RevokeTokenAsync(_currentUser.UserId, request.RefreshToken, GetIpAddress(), GetUserAgent());
        return Ok(new { message = "Logout successful." });
    }

    private string? GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"].FirstOrDefault();

        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
    }

    private string? GetUserAgent()
    {
        if (Request.Headers.TryGetValue("User-Agent", out var userAgent))
            return userAgent.ToString();

        return null;
    }
}
