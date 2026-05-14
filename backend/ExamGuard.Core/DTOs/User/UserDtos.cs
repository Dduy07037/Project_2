using ExamGuard.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace ExamGuard.Core.DTOs.User;

// ─── List / Detail ───
public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? StudentCode { get; set; }
    public string? Department { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ─── Create ───
public class CreateUserRequest
{
    [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;       // "Admin" | "Lecturer" | "Student"
    public string? StudentCode { get; set; }
    public string? Department { get; set; }
}

// ─── Update ───
public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? StudentCode { get; set; }
    public string? Department { get; set; }
}

// ─── Status Change ───
public class UpdateUserStatusRequest
{
    public string Status { get; set; } = string.Empty;      // "Active" | "Disabled" | "Locked"
}

// ─── List Filter ───
public class UserFilterParams
{
    public string? Search { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

// ─── Paged Result ───
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
