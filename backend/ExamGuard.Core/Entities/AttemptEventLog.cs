using ExamGuard.Core.Enums;

namespace ExamGuard.Core.Entities;

/// <summary>
/// Anti-cheating event log. Records tab switches, reloads, concurrent logins, etc.
/// Used for lecturer post-exam review only — never for automatic adjudication.
/// </summary>
public class AttemptEventLog
{
    public Guid Id { get; set; }
    public Guid AttemptId { get; set; }
    public AttemptEventType EventType { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;     // Server receive time
    public DateTime? ClientTimestamp { get; set; }                   // Frontend-reported time
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Details { get; set; }                            // JSON or freeform metadata

    // Navigation
    public ExamAttempt Attempt { get; set; } = null!;
}
