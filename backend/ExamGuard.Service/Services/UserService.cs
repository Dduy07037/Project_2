using ExamGuard.Core.DTOs.User;
using ExamGuard.Core.Entities;
using ExamGuard.Core.Enums;
using ExamGuard.Core.Exceptions;
using ExamGuard.Core.Interfaces;
using ExamGuard.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ExamGuard.Service.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;
    private readonly ILogger<UserService> _logger;

    public UserService(AppDbContext db, ILogger<UserService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(UserFilterParams filter)
    {
        var query = _db.Users.AsQueryable();

        // ─── Filters ───
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(search) ||
                u.Email.ToLower().Contains(search) ||
                (u.StudentCode != null && u.StudentCode.Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(filter.Role) && Enum.TryParse<UserRole>(filter.Role, true, out var role))
            query = query.Where(u => u.Role == role);

        if (!string.IsNullOrWhiteSpace(filter.Status) && Enum.TryParse<UserStatus>(filter.Status, true, out var status))
            query = query.Where(u => u.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(u => MapToDto(u))
            .ToListAsync();

        return new PagedResult<UserDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<UserDto> GetUserByIdAsync(Guid id)
    {
        var user = await _db.Users.FindAsync(id)
            ?? throw new NotFoundException("User", id);
        return MapToDto(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        // Validate email uniqueness
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            throw new ConflictException($"Email '{request.Email}' đã được sử dụng.");

        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            throw new AppException($"Role '{request.Role}' không hợp lệ. Chọn: Admin, Lecturer, Student.");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            throw new AppException("Mật khẩu phải có ít nhất 6 ký tự.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            Role = role,
            StudentCode = request.StudentCode?.Trim(),
            Department = request.Department?.Trim(),
            Status = UserStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        _logger.LogInformation("User created: {Email} ({Role})", user.Email, user.Role);
        return MapToDto(user);
    }

    public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id)
            ?? throw new NotFoundException("User", id);

        user.FullName = request.FullName.Trim();
        user.StudentCode = request.StudentCode?.Trim();
        user.Department = request.Department?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task UpdateUserStatusAsync(Guid id, UpdateUserStatusRequest request)
    {
        var user = await _db.Users.FindAsync(id)
            ?? throw new NotFoundException("User", id);

        if (!Enum.TryParse<UserStatus>(request.Status, true, out var status))
            throw new AppException($"Status '{request.Status}' không hợp lệ. Chọn: Active, Disabled, Locked.");

        user.Status = status;
        user.UpdatedAt = DateTime.UtcNow;

        // Reset failed login count when unlocking
        if (status == UserStatus.Active)
            user.FailedLoginCount = 0;

        await _db.SaveChangesAsync();
        _logger.LogInformation("User {Id} status changed to {Status}", id, status);
    }

    public async Task ResetPasswordAsync(Guid id, string newPassword)
    {
        var user = await _db.Users.FindAsync(id)
            ?? throw new NotFoundException("User", id);

        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            throw new AppException("Mật khẩu mới phải có ít nhất 6 ký tự.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Password reset for user {Id}", id);
    }

    private static UserDto MapToDto(User u) => new()
    {
        Id = u.Id,
        Email = u.Email,
        FullName = u.FullName,
        Role = u.Role.ToString(),
        StudentCode = u.StudentCode,
        Department = u.Department,
        Status = u.Status.ToString(),
        LastLoginAt = u.LastLoginAt,
        CreatedAt = u.CreatedAt
    };
}
