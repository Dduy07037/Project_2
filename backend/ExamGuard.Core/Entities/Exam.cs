using ExamGuard.Core.Enums;

namespace ExamGuard.Core.Entities;

public class Exam
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid SubjectId { get; set; }
    public Guid CreatedById { get; set; }
    public int QuestionCount { get; set; }
    public int DurationMinutes { get; set; }
    public decimal TotalPoints { get; set; } = 10m;
    public bool ShuffleQuestions { get; set; } = true;
    public bool ShuffleOptions { get; set; } = true;
    public bool ShowResultToStudent { get; set; } = true;
    public ExamStatus Status { get; set; } = ExamStatus.Draft;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Subject Subject { get; set; } = null!;
    public User CreatedBy { get; set; } = null!;
    public ICollection<ExamSession> Sessions { get; set; } = new List<ExamSession>();
}
