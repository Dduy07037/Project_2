using ExamGuard.Core.Enums;

namespace ExamGuard.Core.Interfaces;

/// <summary>
/// Provides access to the currently authenticated user's identity.
/// Extracted from HttpContext claims in the API layer, injected into service layer.
/// </summary>
public interface ICurrentUserService
{
    Guid UserId { get; }
    string Email { get; }
    UserRole Role { get; }
    bool IsAuthenticated { get; }
    bool IsAdmin { get; }
    bool IsLecturer { get; }
    bool IsStudent { get; }
}
