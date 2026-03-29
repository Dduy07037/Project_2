namespace ExamGuard.Core.Entities;

/// <summary>
/// Student's answer to a question snapshot.
/// AnsweredAt is used for rapid-answering detection.
/// </summary>
public class AttemptAnswer
{
    public Guid Id { get; set; }
    public Guid AttemptId { get; set; }
    public Guid QuestionSnapshotId { get; set; }
    public Guid? SelectedOptionSnapshotId { get; set; }    // null = unanswered
    public DateTime? AnsweredAt { get; set; }               // Anti-cheat: rapid answer detection
    public bool? IsCorrect { get; set; }                    // Filled after scoring

    // Navigation
    public ExamAttempt Attempt { get; set; } = null!;
    public AttemptQuestionSnapshot QuestionSnapshot { get; set; } = null!;
    public AttemptOptionSnapshot? SelectedOptionSnapshot { get; set; }
}
