using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ExamGuard.Core.Enums;
using ExamGuard.Core.Interfaces;
using ExamGuard.Core.Security;
using Microsoft.AspNetCore.Http;

namespace ExamGuard.Service.Services;

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
            var claimValue = User?.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User?.FindFirstValue(AppClaimTypes.UserId);

            return Guid.TryParse(claimValue, out var userId) ? userId : Guid.Empty;
        }
    }

    public Guid SessionId
    {
        get
        {
            var claimValue = User?.FindFirstValue(ClaimTypes.Sid)
                ?? User?.FindFirstValue(AppClaimTypes.SessionId);

            return Guid.TryParse(claimValue, out var sessionId) ? sessionId : Guid.Empty;
        }
    }

    public string Email => User?.FindFirstValue(ClaimTypes.Email)
        ?? User?.FindFirstValue(JwtRegisteredClaimNames.Email)
        ?? string.Empty;

    public UserRole Role
    {
        get
        {
            var roleValue = User?.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
            return Enum.TryParse<UserRole>(roleValue, true, out var role) ? role : UserRole.Student;
        }
    }

    public bool IsAdmin => Role == UserRole.Admin;
    public bool IsLecturer => Role == UserRole.Lecturer;
    public bool IsStudent => Role == UserRole.Student;
}
