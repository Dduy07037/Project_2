namespace ExamGuard.Core.DTOs.Exam;

// ─── Exam ───
public class ExamDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public Guid CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public int DurationMinutes { get; set; }
    public decimal TotalPoints { get; set; }
    public bool ShuffleQuestions { get; set; }
    public bool ShuffleOptions { get; set; }
    public bool ShowResultToStudent { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<ExamSessionDto> Sessions { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateExamRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid SubjectId { get; set; }
    public int QuestionCount { get; set; }
    public int DurationMinutes { get; set; }
    public decimal TotalPoints { get; set; } = 10m;
    public bool ShuffleQuestions { get; set; } = true;
    public bool ShuffleOptions { get; set; } = true;
    public bool ShowResultToStudent { get; set; } = true;
}

public class UpdateExamRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int QuestionCount { get; set; }
    public int DurationMinutes { get; set; }
    public decimal TotalPoints { get; set; } = 10m;
    public bool ShuffleQuestions { get; set; } = true;
    public bool ShuffleOptions { get; set; } = true;
    public bool ShowResultToStudent { get; set; } = true;
}

// ─── Exam Session ───
public class ExamSessionDto
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int? MaxParticipants { get; set; }
    public int CurrentParticipants { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool HasPassword { get; set; }
}

public class CreateSessionRequest
{
    public string Name { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int? MaxParticipants { get; set; }
    public string? Password { get; set; }
}

public class UpdateSessionRequest
{
    public string Name { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int? MaxParticipants { get; set; }
    public string? Password { get; set; }
}

// ─── Student view: available sessions ───
public class AvailableSessionDto
{
    public Guid SessionId { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string SessionName { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public int DurationMinutes { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool RequiresPassword { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool HasExistingAttempt { get; set; }
}
