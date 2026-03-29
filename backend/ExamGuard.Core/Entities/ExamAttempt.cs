using ExamGuard.Core.Enums;

namespace ExamGuard.Core.Entities;

/// <summary>
/// Core attempt entity. Contains anti-cheating counters and flags.
/// Unique constraint: one InProgress attempt per (SessionId, StudentId).
/// </summary>
public class ExamAttempt
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public Guid SessionId { get; set; }
    public Guid StudentId { get; set; }

    // ─── Timing (server-authoritative) ───
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public AttemptStatus Status { get; set; } = AttemptStatus.InProgress;
    public SubmitType? SubmitType { get; set; }

    // ─── Client metadata (anti-cheat) ───
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    // ─── Anti-cheat counters ───
    public int TabSwitchCount { get; set; }
    public int ReloadCount { get; set; }

    // ─── Lecturer review ───
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }

    // ─── Scoring ───
    public decimal? Score { get; set; }
    public int TotalQuestions { get; set; }
    public int? CorrectAnswers { get; set; }
    public int? TimeSpentSeconds { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Exam Exam { get; set; } = null!;
    public ExamSession Session { get; set; } = null!;
    public User Student { get; set; } = null!;
    public ICollection<AttemptQuestionSnapshot> QuestionSnapshots { get; set; } = new List<AttemptQuestionSnapshot>();
    public ICollection<AttemptAnswer> Answers { get; set; } = new List<AttemptAnswer>();
    public ICollection<AttemptEventLog> EventLogs { get; set; } = new List<AttemptEventLog>();
}
