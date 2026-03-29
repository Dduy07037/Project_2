using ExamGuard.Core.Enums;

namespace ExamGuard.Core.Entities;

public class ExamSession
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int? MaxParticipants { get; set; }
    public string? Password { get; set; }
    public SessionStatus Status { get; set; } = SessionStatus.Scheduled;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Exam Exam { get; set; } = null!;
    public ICollection<ExamAttempt> Attempts { get; set; } = new List<ExamAttempt>();
}
