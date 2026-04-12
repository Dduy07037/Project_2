using ExamGuard.Core.DTOs.Attempt;

namespace ExamGuard.Core.Interfaces;

public interface IAttemptService
{
    Task<AttemptDetailDto> StartAttemptAsync(Guid studentId, StartAttemptRequest request, string? ipAddress, string? userAgent);
    Task<AttemptDetailDto> GetAttemptDetailAsync(Guid attemptId, Guid currentUserId, bool isAdmin, bool isLecturer);
    Task<AttemptAnswerUpdateDto> SaveAnswerAsync(Guid attemptId, Guid questionSnapshotId, Guid studentId, SaveAnswerRequest request);
    Task<AttemptEventResultDto> LogEventAsync(Guid attemptId, Guid studentId, LogAttemptEventRequest request, string? ipAddress, string? userAgent);
    Task<AttemptSummaryDto> SubmitAttemptAsync(Guid attemptId, Guid studentId, SubmitAttemptRequest request, string? ipAddress, string? userAgent);
    Task<List<AttemptSummaryDto>> GetStudentHistoryAsync(Guid studentId);
    Task<List<MonitoringAttemptDto>> GetMonitoringAttemptsAsync(Guid currentUserId, bool isAdmin, MonitoringFilterParams filter);
}
