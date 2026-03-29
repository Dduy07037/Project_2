using ExamGuard.Core.DTOs.Exam;

namespace ExamGuard.Core.Interfaces;

public interface IExamService
{
    // ─── Exam CRUD (Lecturer) ───
    Task<List<ExamDto>> GetExamsAsync(Guid? lecturerId);
    Task<ExamDto> GetExamByIdAsync(Guid id, Guid currentUserId, bool isAdmin);
    Task<ExamDto> CreateExamAsync(CreateExamRequest request, Guid currentUserId);
    Task<ExamDto> UpdateExamAsync(Guid id, UpdateExamRequest request, Guid currentUserId, bool isAdmin);
    Task PublishExamAsync(Guid id, Guid currentUserId, bool isAdmin);

    // ─── Session CRUD ───
    Task<ExamSessionDto> CreateSessionAsync(Guid examId, CreateSessionRequest request, Guid currentUserId, bool isAdmin);
    Task<ExamSessionDto> UpdateSessionAsync(Guid sessionId, UpdateSessionRequest request, Guid currentUserId, bool isAdmin);

    // ─── Student view ───
    Task<List<AvailableSessionDto>> GetAvailableSessionsAsync(Guid studentId);
}
