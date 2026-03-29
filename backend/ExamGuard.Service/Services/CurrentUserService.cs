using System.Security.Claims;
using ExamGuard.Core.Enums;
using ExamGuard.Core.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ExamGuard.Service.Services;

/// <summary>
/// Extracts the authenticated user's identity from JWT claims.
/// Registered as Scoped — one instance per HTTP request.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public Guid UserId
    {
        get
        {
            var sub = User?.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? User?.FindFirstValue("sub");

            return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
        }
    }

    public string Email => User?.FindFirstValue(ClaimTypes.Email)
                        ?? User?.FindFirstValue("email")
                        ?? string.Empty;

    public UserRole Role
    {
        get
        {
            var roleStr = User?.FindFirstValue(ClaimTypes.Role)
                       ?? User?.FindFirstValue("role");

            return Enum.TryParse<UserRole>(roleStr, true, out var role) ? role : UserRole.Student;
        }
    }

    public bool IsAdmin => Role == UserRole.Admin;
    public bool IsLecturer => Role == UserRole.Lecturer;
    public bool IsStudent => Role == UserRole.Student;
}
