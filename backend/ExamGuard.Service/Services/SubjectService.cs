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

    public async Task<SubjectDto> GetSubjectByIdAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var subject = await _db.Subjects
            .Include(s => s.CreatedBy)
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new NotFoundException("Subject", id);

        if (!isAdmin && subject.CreatedById != currentUserId)
            throw new ForbiddenException("You do not have permission to view this subject.");

        return new SubjectDto
        {
            Id = subject.Id,
            Code = subject.Code,
            Name = subject.Name,
            Department = subject.Department,
            CreatedById = subject.CreatedById,
            CreatedByName = subject.CreatedBy.FullName,
            QuestionCount = await _db.Questions.CountAsync(q => q.SubjectId == id && q.IsActive),
            ExamCount = await _db.Exams.CountAsync(e => e.SubjectId == id),
            IsActive = subject.IsActive,
            CreatedAt = subject.CreatedAt
        };
    }

    public async Task<SubjectDto> CreateSubjectAsync(CreateSubjectRequest request, Guid currentUserId)
    {
        if (await _db.Subjects.AnyAsync(s => s.Code == request.Code))
            throw new ConflictException($"Subject code '{request.Code}' already exists.");

        var subject = new Subject
        {
            Id = Guid.NewGuid(),
            Code = request.Code.Trim().ToUpperInvariant(),
            Name = request.Name.Trim(),
            Department = request.Department?.Trim(),
            CreatedById = request.CreatedById ?? currentUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Subjects.Add(subject);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Subject created: {Code} by user {UserId}", subject.Code, currentUserId);
        return await GetSubjectByIdAsync(subject.Id, currentUserId, false);
    }

    public async Task<SubjectDto> UpdateSubjectAsync(Guid id, UpdateSubjectRequest request, Guid currentUserId, bool isAdmin)
    {
        var subject = await _db.Subjects.FindAsync(id)
            ?? throw new NotFoundException("Subject", id);

        if (!isAdmin && subject.CreatedById != currentUserId)
            throw new ForbiddenException("You do not have permission to update this subject.");

        subject.Name = request.Name.Trim();
        subject.Department = request.Department?.Trim();
        subject.IsActive = request.IsActive;
        subject.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetSubjectByIdAsync(id, currentUserId, isAdmin);
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync(Guid subjectId, Guid currentUserId, bool isAdmin)
    {
        var subject = await _db.Subjects.FindAsync(subjectId)
            ?? throw new NotFoundException("Subject", subjectId);

        if (!isAdmin && subject.CreatedById != currentUserId)
            throw new ForbiddenException("You do not have permission to view categories for this subject.");

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
            throw new ForbiddenException("You do not have permission to add categories to this subject.");

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
            throw new ForbiddenException("You do not have permission to delete this category.");

        _db.QuestionCategories.Remove(category);
        await _db.SaveChangesAsync();
    }
}
