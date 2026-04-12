namespace ExamGuard.Core.DTOs.Attempt;

public class StartAttemptRequest
{
    public Guid SessionId { get; set; }
    public string? Password { get; set; }
}

public class SaveAnswerRequest
{
    public Guid? SelectedOptionSnapshotId { get; set; }
    public DateTime? ClientTimestamp { get; set; }
}

public class SubmitAttemptRequest
{
    public string SubmitType { get; set; } = "Manual";
    public DateTime? ClientTimestamp { get; set; }
}

public class LogAttemptEventRequest
{
    public string EventType { get; set; } = string.Empty;
    public DateTime? ClientTimestamp { get; set; }
    public string? Details { get; set; }
}

public class AttemptPolicyDto
{
    public int MaxTabSwitches { get; set; }
    public bool AutoSubmitOnTabLimit { get; set; }
    public bool AllowCopyPaste { get; set; }
    public int RapidAnswerThresholdSeconds { get; set; }
}

public class AttemptSummaryDto
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public Guid SessionId { get; set; }
    public string SessionName { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string? StudentCode { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? SubmitType { get; set; }
    public decimal? Score { get; set; }
    public int TotalQuestions { get; set; }
    public int AnsweredQuestions { get; set; }
    public int? CorrectAnswers { get; set; }
    public int? TimeSpentSeconds { get; set; }
    public int TabSwitchCount { get; set; }
    public int ReloadCount { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public DateTime SessionStartTime { get; set; }
    public DateTime SessionEndTime { get; set; }
    public bool ShowResultToStudent { get; set; }
}

public class AttemptDetailDto
{
    public AttemptSummaryDto Attempt { get; set; } = new();
    public string ExamDescription { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal TotalPoints { get; set; }
    public bool ShuffleQuestions { get; set; }
    public bool ShuffleOptions { get; set; }
    public AttemptPolicyDto Policy { get; set; } = new();
    public List<AttemptQuestionSnapshotDto> Questions { get; set; } = new();
    public List<AttemptEventDto> RecentEvents { get; set; } = new();
}

public class AttemptQuestionSnapshotDto
{
    public Guid Id { get; set; }
    public Guid OriginalQuestionId { get; set; }
    public int SortOrder { get; set; }
    public string Content { get; set; } = string.Empty;
    public decimal PointValue { get; set; }
    public Guid? SelectedOptionSnapshotId { get; set; }
    public List<AttemptOptionSnapshotDto> Options { get; set; } = new();
}

public class AttemptOptionSnapshotDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class AttemptEventDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public DateTime? ClientTimestamp { get; set; }
    public string? Details { get; set; }
}

public class AttemptAnswerUpdateDto
{
    public Guid AttemptId { get; set; }
    public Guid QuestionSnapshotId { get; set; }
    public Guid? SelectedOptionSnapshotId { get; set; }
    public DateTime? AnsweredAt { get; set; }
    public int AnsweredQuestions { get; set; }
}

public class AttemptEventResultDto
{
    public AttemptSummaryDto Attempt { get; set; } = new();
    public bool AutoSubmitted { get; set; }
    public List<AttemptEventDto> RecentEvents { get; set; } = new();
}

public class MonitoringAttemptDto
{
    public AttemptSummaryDto Attempt { get; set; } = new();
    public List<AttemptEventDto> RecentEvents { get; set; } = new();
}

public class MonitoringFilterParams
{
    public Guid? ExamId { get; set; }
    public Guid? SessionId { get; set; }
    public bool FlaggedOnly { get; set; }
    public string? Search { get; set; }
    public int Limit { get; set; } = 100;
}
