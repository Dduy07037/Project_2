using ExamGuard.Core.Enums;

namespace ExamGuard.Core.Entities;

public class Subject
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Department { get; set; }
    public Guid CreatedById { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User CreatedBy { get; set; } = null!;
    public ICollection<QuestionCategory> Categories { get; set; } = new List<QuestionCategory>();
    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
