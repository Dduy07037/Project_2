namespace ExamGuard.Core.Entities;

public class QuestionOption
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Label { get; set; } = string.Empty;   // "A", "B", "C", "D"
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }

    // Navigation
    public Question Question { get; set; } = null!;
}
