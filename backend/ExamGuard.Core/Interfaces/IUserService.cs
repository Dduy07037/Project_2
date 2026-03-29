using ExamGuard.Core.DTOs.User;

namespace ExamGuard.Core.Interfaces;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetUsersAsync(UserFilterParams filter);
    Task<UserDto> GetUserByIdAsync(Guid id);
    Task<UserDto> CreateUserAsync(CreateUserRequest request);
    Task<UserDto> UpdateUserAsync(Guid id, UpdateUserRequest request);
    Task UpdateUserStatusAsync(Guid id, UpdateUserStatusRequest request);
    Task ResetPasswordAsync(Guid id, string newPassword);
}
