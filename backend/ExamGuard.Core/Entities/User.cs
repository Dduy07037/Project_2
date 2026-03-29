using ExamGuard.Core.Enums;

namespace ExamGuard.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? StudentCode { get; set; }
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Active;
    public string? Department { get; set; }
    public int FailedLoginCount { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Subject> CreatedSubjects { get; set; } = new List<Subject>();
    public ICollection<Question> CreatedQuestions { get; set; } = new List<Question>();
    public ICollection<Exam> CreatedExams { get; set; } = new List<Exam>();
    public ICollection<ExamAttempt> Attempts { get; set; } = new List<ExamAttempt>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
