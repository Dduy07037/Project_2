namespace ExamGuard.Core.Security;

public static class AppRoleNames
{
    public const string Admin = "Admin";
    public const string Lecturer = "Lecturer";
    public const string Student = "Student";

    public const string AdminOrLecturer = Admin + "," + Lecturer;
}

public static class AppClaimTypes
{
    public const string UserId = "userId";
    public const string SessionId = "sessionId";
}
