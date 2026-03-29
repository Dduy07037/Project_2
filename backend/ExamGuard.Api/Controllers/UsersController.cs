using ExamGuard.Core.DTOs.User;
using ExamGuard.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// List users with optional filters. Admin only.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<UserDto>>> GetUsers([FromQuery] UserFilterParams filter)
    {
        var result = await _userService.GetUsersAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// Get user by ID. Admin only.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        return Ok(user);
    }

    /// <summary>
    /// Create a new user. Admin only.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = await _userService.CreateUserAsync(request);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    /// <summary>
    /// Update user profile. Admin only.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userService.UpdateUserAsync(id, request);
        return Ok(user);
    }

    /// <summary>
    /// Change user status (Active/Disabled/Locked). Admin only.
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UpdateUserStatusRequest request)
    {
        await _userService.UpdateUserStatusAsync(id, request);
        return Ok(new { message = "Cập nhật trạng thái thành công." });
    }

    /// <summary>
    /// Reset user password. Admin only.
    /// </summary>
    [HttpPatch("{id:guid}/reset-password")]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
    {
        await _userService.ResetPasswordAsync(id, request.NewPassword);
        return Ok(new { message = "Đặt lại mật khẩu thành công." });
    }
}

public class ResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}
