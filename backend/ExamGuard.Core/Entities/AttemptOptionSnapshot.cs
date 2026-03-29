namespace ExamGuard.Core.Entities;

/// <summary>
/// Snapshot of an option at exam-start time.
/// Labels may be shuffled (A→C, B→A, etc.).
/// IsCorrect is frozen here for accurate scoring.
/// </summary>
public class AttemptOptionSnapshot
{
    public Guid Id { get; set; }
    public Guid QuestionSnapshotId { get; set; }
    public Guid OriginalOptionId { get; set; }
    public string Label { get; set; } = string.Empty;     // After shuffle: "A", "B", "C", "D"
    public string Content { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsCorrect { get; set; }

    // Navigation
    public AttemptQuestionSnapshot QuestionSnapshot { get; set; } = null!;
}
