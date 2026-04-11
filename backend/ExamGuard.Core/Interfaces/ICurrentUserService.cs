using ExamGuard.Core.Enums;

namespace ExamGuard.Core.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid SessionId { get; }
    string Email { get; }
    UserRole Role { get; }
    bool IsAuthenticated { get; }
    bool IsAdmin { get; }
    bool IsLecturer { get; }
    bool IsStudent { get; }
}
