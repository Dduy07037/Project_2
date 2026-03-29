namespace ExamGuard.Core.Entities;

public class QuestionCategory
{
    public Guid Id { get; set; }
    public Guid SubjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Subject Subject { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
