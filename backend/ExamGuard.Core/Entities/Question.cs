using ExamGuard.Core.Enums;

namespace ExamGuard.Core.Entities;

public class Question
{
    public Guid Id { get; set; }
    public Guid SubjectId { get; set; }
    public Guid? CategoryId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Difficulty Difficulty { get; set; } = Difficulty.Medium;
    public bool IsActive { get; set; } = true;
    public Guid CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Subject Subject { get; set; } = null!;
    public QuestionCategory? Category { get; set; }
    public User CreatedBy { get; set; } = null!;
    public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
}
