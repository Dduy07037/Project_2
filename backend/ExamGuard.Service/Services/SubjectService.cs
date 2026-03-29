using ExamGuard.Core.DTOs.Question;
using ExamGuard.Core.Entities;
using ExamGuard.Core.Exceptions;
using ExamGuard.Core.Interfaces;
using ExamGuard.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ExamGuard.Service.Services;

public class SubjectService : ISubjectService
{
    private readonly AppDbContext _db;
    private readonly ILogger<SubjectService> _logger;

    public SubjectService(AppDbContext db, ILogger<SubjectService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<SubjectDto>> GetSubjectsAsync(Guid? lecturerId)
    {
        var query = _db.Subjects
            .Include(s => s.CreatedBy)
            .AsQueryable();

        // Lecturer only sees their own subjects
        if (lecturerId.HasValue)
            query = query.Where(s => s.CreatedById == lecturerId.Value);

        return await query
            .OrderBy(s => s.Code)
            .Select(s => new SubjectDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                Department = s.Department,
                CreatedById = s.CreatedById,
                CreatedByName = s.CreatedBy.FullName,
                QuestionCount = s.Questions.Count(q => q.IsActive),
                ExamCount = s.Exams.Count,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<SubjectDto> GetSubjectByIdAsync(Guid id)
    {
        var s = await _db.Subjects
            .Include(s => s.CreatedBy)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new NotFoundException("Subject", id);

        return new SubjectDto
        {
            Id = s.Id,
            Code = s.Code,
            Name = s.Name,
            Department = s.Department,
            CreatedById = s.CreatedById,
            CreatedByName = s.CreatedBy.FullName,
            QuestionCount = await _db.Questions.CountAsync(q => q.SubjectId == id && q.IsActive),
            ExamCount = await _db.Exams.CountAsync(e => e.SubjectId == id),
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt
        };
    }

    public async Task<SubjectDto> CreateSubjectAsync(CreateSubjectRequest request, Guid currentUserId)
    {
        if (await _db.Subjects.AnyAsync(s => s.Code == request.Code))
            throw new ConflictException($"Mã môn học '{request.Code}' đã tồn tại.");

        var subject = new Subject
        {
            Id = Guid.NewGuid(),
            Code = request.Code.Trim().ToUpper(),
            Name = request.Name.Trim(),
            Department = request.Department?.Trim(),
            CreatedById = request.CreatedById ?? currentUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Subjects.Add(subject);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Subject created: {Code} by user {UserId}", subject.Code, currentUserId);
        return await GetSubjectByIdAsync(subject.Id);
    }

    public async Task<SubjectDto> UpdateSubjectAsync(Guid id, UpdateSubjectRequest request, Guid currentUserId, bool isAdmin)
    {
        var subject = await _db.Subjects.FindAsync(id)
            ?? throw new NotFoundException("Subject", id);

        // Object-level auth: only owner or admin
        if (!isAdmin && subject.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa môn học này.");

        subject.Name = request.Name.Trim();
        subject.Department = request.Department?.Trim();
        subject.IsActive = request.IsActive;
        subject.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetSubjectByIdAsync(id);
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync(Guid subjectId)
    {
        if (!await _db.Subjects.AnyAsync(s => s.Id == subjectId))
            throw new NotFoundException("Subject", subjectId);

        return await _db.QuestionCategories
            .Where(c => c.SubjectId == subjectId)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                SubjectId = c.SubjectId,
                Name = c.Name,
                QuestionCount = c.Questions.Count(q => q.IsActive),
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<CategoryDto> CreateCategoryAsync(Guid subjectId, CreateCategoryRequest request, Guid currentUserId, bool isAdmin)
    {
        var subject = await _db.Subjects.FindAsync(subjectId)
            ?? throw new NotFoundException("Subject", subjectId);

        if (!isAdmin && subject.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền thêm chủ đề cho môn học này.");

        var category = new QuestionCategory
        {
            Id = Guid.NewGuid(),
            SubjectId = subjectId,
            Name = request.Name.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.QuestionCategories.Add(category);
        await _db.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            SubjectId = category.SubjectId,
            Name = category.Name,
            QuestionCount = 0,
            CreatedAt = category.CreatedAt
        };
    }

    public async Task DeleteCategoryAsync(Guid categoryId, Guid currentUserId, bool isAdmin)
    {
        var category = await _db.QuestionCategories
            .Include(c => c.Subject)
            .FirstOrDefaultAsync(c => c.Id == categoryId)
            ?? throw new NotFoundException("Category", categoryId);

        if (!isAdmin && category.Subject.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền xóa chủ đề này.");

        _db.QuestionCategories.Remove(category);
        await _db.SaveChangesAsync();
    }
}
