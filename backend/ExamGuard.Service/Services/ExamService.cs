using ExamGuard.Core.DTOs.Exam;
using ExamGuard.Core.Entities;
using ExamGuard.Core.Enums;
using ExamGuard.Core.Exceptions;
using ExamGuard.Core.Interfaces;
using ExamGuard.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ExamGuard.Service.Services;

public class ExamService : IExamService
{
    private readonly AppDbContext _db;
    private readonly ILogger<ExamService> _logger;

    public ExamService(AppDbContext db, ILogger<ExamService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ═══════════════════════════════════════════════
    //  EXAM CRUD
    // ═══════════════════════════════════════════════

    public async Task<List<ExamDto>> GetExamsAsync(Guid? lecturerId)
    {
        var query = _db.Exams
            .Include(e => e.Subject)
            .Include(e => e.CreatedBy)
            .Include(e => e.Sessions)
            .AsQueryable();

        if (lecturerId.HasValue)
            query = query.Where(e => e.CreatedById == lecturerId.Value);

        return await query
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => MapToDto(e))
            .ToListAsync();
    }

    public async Task<ExamDto> GetExamByIdAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var exam = await _db.Exams
            .Include(e => e.Subject)
            .Include(e => e.CreatedBy)
            .Include(e => e.Sessions)
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new NotFoundException("Exam", id);

        if (!isAdmin && exam.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền xem kỳ thi này.");

        return MapToDto(exam);
    }

    public async Task<ExamDto> CreateExamAsync(CreateExamRequest request, Guid currentUserId)
    {
        var subject = await _db.Subjects.FindAsync(request.SubjectId)
            ?? throw new NotFoundException("Subject", request.SubjectId);

        if (subject.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền tạo kỳ thi cho môn học này.");

        // Validate
        if (request.QuestionCount < 1)
            throw new AppException("Số câu hỏi phải lớn hơn 0.");
        if (request.DurationMinutes < 1)
            throw new AppException("Thời gian làm bài phải lớn hơn 0.");

        // Check question bank has enough active questions
        var availableCount = await _db.Questions.CountAsync(q => q.SubjectId == request.SubjectId && q.IsActive);
        if (availableCount < request.QuestionCount)
            throw new AppException($"Ngân hàng câu hỏi chỉ có {availableCount} câu (cần {request.QuestionCount}). Vui lòng thêm câu hỏi.");

        var exam = new Exam
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            SubjectId = request.SubjectId,
            CreatedById = currentUserId,
            QuestionCount = request.QuestionCount,
            DurationMinutes = request.DurationMinutes,
            TotalPoints = request.TotalPoints,
            ShuffleQuestions = request.ShuffleQuestions,
            ShuffleOptions = request.ShuffleOptions,
            ShowResultToStudent = request.ShowResultToStudent,
            Status = ExamStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Exams.Add(exam);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Exam created: {Title} ({Id})", exam.Title, exam.Id);
        return await GetExamByIdAsync(exam.Id, currentUserId, false);
    }

    public async Task<ExamDto> UpdateExamAsync(Guid id, UpdateExamRequest request, Guid currentUserId, bool isAdmin)
    {
        var exam = await _db.Exams.FindAsync(id)
            ?? throw new NotFoundException("Exam", id);

        if (!isAdmin && exam.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa kỳ thi này.");

        if (exam.Status != ExamStatus.Draft)
            throw new AppException("Chỉ có thể chỉnh sửa kỳ thi ở trạng thái nháp (Draft).");

        if (request.QuestionCount < 1 || request.DurationMinutes < 1)
            throw new AppException("Số câu hỏi và thời gian phải lớn hơn 0.");

        exam.Title = request.Title.Trim();
        exam.Description = request.Description?.Trim();
        exam.QuestionCount = request.QuestionCount;
        exam.DurationMinutes = request.DurationMinutes;
        exam.TotalPoints = request.TotalPoints;
        exam.ShuffleQuestions = request.ShuffleQuestions;
        exam.ShuffleOptions = request.ShuffleOptions;
        exam.ShowResultToStudent = request.ShowResultToStudent;
        exam.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetExamByIdAsync(id, currentUserId, isAdmin);
    }

    public async Task PublishExamAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var exam = await _db.Exams
            .Include(e => e.Sessions)
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw new NotFoundException("Exam", id);

        if (!isAdmin && exam.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền publish kỳ thi này.");

        if (exam.Status != ExamStatus.Draft)
            throw new AppException("Chỉ có thể publish kỳ thi ở trạng thái nháp (Draft).");

        if (!exam.Sessions.Any())
            throw new AppException("Kỳ thi phải có ít nhất 1 ca thi trước khi publish.");

        // Re-verify question count
        var availableCount = await _db.Questions.CountAsync(q => q.SubjectId == exam.SubjectId && q.IsActive);
        if (availableCount < exam.QuestionCount)
            throw new AppException($"Ngân hàng câu hỏi chỉ có {availableCount} câu (cần {exam.QuestionCount}).");

        exam.Status = ExamStatus.Published;
        exam.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Exam published: {Title} ({Id})", exam.Title, exam.Id);
    }

    // ═══════════════════════════════════════════════
    //  SESSION CRUD
    // ═══════════════════════════════════════════════

    public async Task<ExamSessionDto> CreateSessionAsync(Guid examId, CreateSessionRequest request, Guid currentUserId, bool isAdmin)
    {
        var exam = await _db.Exams.FindAsync(examId)
            ?? throw new NotFoundException("Exam", examId);

        if (!isAdmin && exam.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền tạo ca thi cho kỳ thi này.");

        if (exam.Status != ExamStatus.Draft && exam.Status != ExamStatus.Published)
            throw new AppException("Không thể thêm ca thi ở trạng thái hiện tại.");

        if (request.EndTime <= request.StartTime)
            throw new AppException("Thời gian kết thúc phải sau thời gian bắt đầu.");

        var session = new ExamSession
        {
            Id = Guid.NewGuid(),
            ExamId = examId,
            Name = request.Name.Trim(),
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            MaxParticipants = request.MaxParticipants,
            Password = request.Password,
            Status = SessionStatus.Scheduled,
            CreatedAt = DateTime.UtcNow
        };

        _db.ExamSessions.Add(session);
        await _db.SaveChangesAsync();

        return MapSessionToDto(session);
    }

    public async Task<ExamSessionDto> UpdateSessionAsync(Guid sessionId, UpdateSessionRequest request, Guid currentUserId, bool isAdmin)
    {
        var session = await _db.ExamSessions
            .Include(s => s.Exam)
            .FirstOrDefaultAsync(s => s.Id == sessionId)
            ?? throw new NotFoundException("ExamSession", sessionId);

        if (!isAdmin && session.Exam.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa ca thi này.");

        if (session.Status != SessionStatus.Scheduled)
            throw new AppException("Chỉ có thể chỉnh sửa ca thi chưa bắt đầu.");

        if (request.EndTime <= request.StartTime)
            throw new AppException("Thời gian kết thúc phải sau thời gian bắt đầu.");

        session.Name = request.Name.Trim();
        session.StartTime = request.StartTime;
        session.EndTime = request.EndTime;
        session.MaxParticipants = request.MaxParticipants;
        session.Password = request.Password;

        await _db.SaveChangesAsync();
        return MapSessionToDto(session);
    }

    // ═══════════════════════════════════════════════
    //  STUDENT: Available Sessions
    // ═══════════════════════════════════════════════

    public async Task<List<AvailableSessionDto>> GetAvailableSessionsAsync(Guid studentId)
    {
        var now = DateTime.UtcNow;

        var sessions = await _db.ExamSessions
            .Include(s => s.Exam).ThenInclude(e => e.Subject)
            .Where(s => s.Exam.Status == ExamStatus.Published || s.Exam.Status == ExamStatus.Active)
            .Where(s => s.Status == SessionStatus.Scheduled || s.Status == SessionStatus.Active)
            .Where(s => s.EndTime > now) // Not yet ended
            .OrderBy(s => s.StartTime)
            .ToListAsync();

        var sessionIds = sessions.Select(s => s.Id).ToList();
        var existingAttempts = await _db.ExamAttempts
            .Where(a => a.StudentId == studentId && sessionIds.Contains(a.SessionId))
            .Select(a => new
            {
                a.SessionId,
                a.Id,
                a.Status
            })
            .ToListAsync();

        return sessions.Select(s => new AvailableSessionDto
        {
            SessionId = s.Id,
            ExamId = s.ExamId,
            ExamTitle = s.Exam.Title,
            ExamDescription = s.Exam.Description,
            SubjectName = s.Exam.Subject.Name,
            SubjectCode = s.Exam.Subject.Code,
            SessionName = s.Name,
            QuestionCount = s.Exam.QuestionCount,
            DurationMinutes = s.Exam.DurationMinutes,
            TotalPoints = s.Exam.TotalPoints,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            RequiresPassword = !string.IsNullOrEmpty(s.Password),
            Status = s.StartTime <= now && s.EndTime > now ? "Active" : "Scheduled",
            HasExistingAttempt = existingAttempts.Any(a => a.SessionId == s.Id),
            AttemptId = existingAttempts.FirstOrDefault(a => a.SessionId == s.Id)?.Id,
            AttemptStatus = existingAttempts.FirstOrDefault(a => a.SessionId == s.Id)?.Status.ToString(),
            ShowResultToStudent = s.Exam.ShowResultToStudent,
            ShuffleQuestions = s.Exam.ShuffleQuestions,
            ShuffleOptions = s.Exam.ShuffleOptions
        }).ToList();
    }

    // ═══════════════════════════════════════════════
    //  MAPPING
    // ═══════════════════════════════════════════════

    private static ExamDto MapToDto(Exam e) => new()
    {
        Id = e.Id,
        Title = e.Title,
        Description = e.Description,
        SubjectId = e.SubjectId,
        SubjectName = e.Subject?.Name ?? "",
        SubjectCode = e.Subject?.Code ?? "",
        CreatedById = e.CreatedById,
        CreatedByName = e.CreatedBy?.FullName ?? "",
        QuestionCount = e.QuestionCount,
        DurationMinutes = e.DurationMinutes,
        TotalPoints = e.TotalPoints,
        ShuffleQuestions = e.ShuffleQuestions,
        ShuffleOptions = e.ShuffleOptions,
        ShowResultToStudent = e.ShowResultToStudent,
        Status = e.Status.ToString(),
        Sessions = e.Sessions?.Select(s => MapSessionToDto(s)).ToList() ?? new(),
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };

    private static ExamSessionDto MapSessionToDto(ExamSession s) => new()
    {
        Id = s.Id,
        ExamId = s.ExamId,
        Name = s.Name,
        StartTime = s.StartTime,
        EndTime = s.EndTime,
        MaxParticipants = s.MaxParticipants,
        CurrentParticipants = s.Attempts?.Count ?? 0,
        Status = s.Status.ToString(),
        HasPassword = !string.IsNullOrEmpty(s.Password)
    };
}
