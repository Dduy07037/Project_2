namespace ExamGuard.Core.Entities;

/// <summary>
/// Snapshot of a question at exam-start time.
/// Editing the question bank after this point does NOT affect this snapshot.
/// Scoring is done against this snapshot, not the current question bank.
/// </summary>
public class AttemptQuestionSnapshot
{
    public Guid Id { get; set; }
    public Guid AttemptId { get; set; }
    public Guid OriginalQuestionId { get; set; }
    public int SortOrder { get; set; }
    public string Content { get; set; } = string.Empty;
    public decimal PointValue { get; set; }

    // Navigation
    public ExamAttempt Attempt { get; set; } = null!;
    public ICollection<AttemptOptionSnapshot> OptionSnapshots { get; set; } = new List<AttemptOptionSnapshot>();
    public AttemptAnswer? Answer { get; set; }
}
