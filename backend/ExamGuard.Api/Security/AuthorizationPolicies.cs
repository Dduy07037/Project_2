namespace ExamGuard.Api.Security;

public static class AuthorizationPolicies
{
    public const string AdminOnly = "AdminOnly";
    public const string AdminOrLecturer = "AdminOrLecturer";
    public const string LecturerOnly = "LecturerOnly";
    public const string StudentOnly = "StudentOnly";
}
