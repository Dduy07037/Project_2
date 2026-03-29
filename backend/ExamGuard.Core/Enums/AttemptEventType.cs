namespace ExamGuard.Core.Enums;

/// <summary>
/// Types of events logged during an exam attempt for anti-cheating review.
/// </summary>
public enum AttemptEventType
{
    ExamStart = 0,
    ExamSubmit = 1,
    TabLeave = 2,
    TabReturn = 3,
    PageReload = 4,
    CopyAttempt = 5,
    PasteAttempt = 6,
    RightClick = 7,
    IdleDetected = 8,
    ResumeAttempt = 9,
    ConcurrentLogin = 10,
    AnswerChanged = 11,
    WindowBlur = 12,
    WindowFocus = 13
}
