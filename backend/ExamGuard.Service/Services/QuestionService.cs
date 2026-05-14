using ExamGuard.Core.DTOs.Question;
using ExamGuard.Core.DTOs.User;
using ExamGuard.Core.Entities;
using ExamGuard.Core.Enums;
using ExamGuard.Core.Exceptions;
using ExamGuard.Core.Interfaces;
using ExamGuard.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ExamGuard.Service.Services;

public class QuestionService : IQuestionService
{
    private readonly AppDbContext _db;
    private readonly ILogger<QuestionService> _logger;

    public QuestionService(AppDbContext db, ILogger<QuestionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<PagedResult<QuestionDto>> GetQuestionsAsync(QuestionFilterParams filter, Guid currentUserId, bool isAdmin)
    {
        var query = _db.Questions
            .Include(q => q.Options)
            .Include(q => q.Subject)
            .Include(q => q.Category)
            .AsQueryable();

        // Object-level: lecturer only sees questions in their subjects
        if (!isAdmin)
            query = query.Where(q => q.Subject.CreatedById == currentUserId);

        if (filter.SubjectId.HasValue)
            query = query.Where(q => q.SubjectId == filter.SubjectId.Value);

        if (filter.CategoryId.HasValue)
            query = query.Where(q => q.CategoryId == filter.CategoryId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Difficulty) && Enum.TryParse<Difficulty>(filter.Difficulty, true, out var diff))
            query = query.Where(q => q.Difficulty == diff);

        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(q => q.Content.ToLower().Contains(filter.Search.ToLower()));

        if (filter.IsActive.HasValue)
            query = query.Where(q => q.IsActive == filter.IsActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(q => q.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResult<QuestionDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<QuestionDto> GetQuestionByIdAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var question = await _db.Questions
            .Include(q => q.Options.OrderBy(o => o.SortOrder))
            .Include(q => q.Subject)
            .Include(q => q.Category)
            .FirstOrDefaultAsync(q => q.Id == id)
            ?? throw new NotFoundException("Question", id);

        if (!isAdmin && question.Subject.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền xem câu hỏi này.");

        return MapToDto(question);
    }

    public async Task<QuestionDto> CreateQuestionAsync(CreateQuestionRequest request, Guid currentUserId)
    {
        // Verify subject ownership
        var subject = await _db.Subjects.FindAsync(request.SubjectId)
            ?? throw new NotFoundException("Subject", request.SubjectId);

        if (!subject.IsActive)
            throw new AppException("Subject is inactive. Cannot create questions for this subject.");

        if (subject.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền thêm câu hỏi cho môn học này.");

        ValidateQuestionPayload(request.Content, request.Options);
        await EnsureCategoryBelongsToSubjectAsync(request.CategoryId, request.SubjectId);

        // Validate
        if (request.Options.Count < 2)
            throw new AppException("Câu hỏi phải có ít nhất 2 đáp án.");

        if (request.Options.Count(o => o.IsCorrect) != 1)
            throw new AppException("Câu hỏi phải có đúng 1 đáp án đúng.");

        if (!Enum.TryParse<Difficulty>(request.Difficulty, true, out var difficulty))
            throw new AppException($"Độ khó '{request.Difficulty}' không hợp lệ.");

        if (request.CategoryId.HasValue)
        {
            var categoryExists = await _db.QuestionCategories
                .AnyAsync(c => c.Id == request.CategoryId.Value && c.SubjectId == request.SubjectId);
            if (!categoryExists)
                throw new AppException("Chủ đề không thuộc môn học này.");
        }

        var question = new Question
        {
            Id = Guid.NewGuid(),
            SubjectId = request.SubjectId,
            CategoryId = request.CategoryId,
            Content = request.Content.Trim(),
            Difficulty = difficulty,
            CreatedById = currentUserId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        for (int i = 0; i < request.Options.Count; i++)
        {
            var opt = request.Options[i];
            question.Options.Add(new QuestionOption
            {
                Id = Guid.NewGuid(),
                QuestionId = question.Id,
                Label = opt.Label.Trim(),
                Content = opt.Content.Trim(),
                IsCorrect = opt.IsCorrect,
                SortOrder = i
            });
        }

        _db.Questions.Add(question);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Question created: {Id} in subject {SubjectId}", question.Id, question.SubjectId);
        return await GetQuestionByIdAsync(question.Id, currentUserId, false);
    }

    public async Task<QuestionDto> UpdateQuestionAsync(Guid id, UpdateQuestionRequest request, Guid currentUserId, bool isAdmin)
    {
        var question = await _db.Questions
            .Include(q => q.Options)
            .Include(q => q.Subject)
            .FirstOrDefaultAsync(q => q.Id == id)
            ?? throw new NotFoundException("Question", id);

        if (!question.Subject.IsActive)
            throw new AppException("Subject is inactive. Cannot update questions for this subject.");

        if (!isAdmin && question.Subject.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa câu hỏi này.");

        ValidateQuestionPayload(request.Content, request.Options);
        await EnsureCategoryBelongsToSubjectAsync(request.CategoryId, question.SubjectId);

        if (request.Options.Count < 2)
            throw new AppException("Câu hỏi phải có ít nhất 2 đáp án.");

        if (request.Options.Count(o => o.IsCorrect) != 1)
            throw new AppException("Câu hỏi phải có đúng 1 đáp án đúng.");

        if (!Enum.TryParse<Difficulty>(request.Difficulty, true, out var difficulty))
            throw new AppException($"Độ khó '{request.Difficulty}' không hợp lệ.");

        question.CategoryId = request.CategoryId;
        question.Content = request.Content.Trim();
        question.Difficulty = difficulty;
        question.UpdatedAt = DateTime.UtcNow;

        // Replace all options
        _db.QuestionOptions.RemoveRange(question.Options);

        for (int i = 0; i < request.Options.Count; i++)
        {
            var opt = request.Options[i];
            question.Options.Add(new QuestionOption
            {
                Id = Guid.NewGuid(),
                QuestionId = question.Id,
                Label = opt.Label.Trim(),
                Content = opt.Content.Trim(),
                IsCorrect = opt.IsCorrect,
                SortOrder = i
            });
        }

        await _db.SaveChangesAsync();
        return await GetQuestionByIdAsync(id, currentUserId, isAdmin);
    }

    public async Task DeleteQuestionAsync(Guid id, Guid currentUserId, bool isAdmin)
    {
        var question = await _db.Questions
            .Include(q => q.Subject)
            .FirstOrDefaultAsync(q => q.Id == id)
            ?? throw new NotFoundException("Question", id);

        if (!isAdmin && question.Subject.CreatedById != currentUserId)
            throw new ForbiddenException("Bạn không có quyền xóa câu hỏi này.");

        // Soft delete
        question.IsActive = false;
        question.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Question soft-deleted: {Id}", id);
    }

    private static QuestionDto MapToDto(Question q) => new()
    {
        Id = q.Id,
        SubjectId = q.SubjectId,
        SubjectName = q.Subject?.Name ?? "",
        CategoryId = q.CategoryId,
        CategoryName = q.Category?.Name,
        Content = q.Content,
        Difficulty = q.Difficulty.ToString(),
        IsActive = q.IsActive,
        Options = q.Options.OrderBy(o => o.SortOrder).Select(o => new QuestionOptionDto
        {
            Id = o.Id,
            Label = o.Label,
            Content = o.Content,
            IsCorrect = o.IsCorrect,
            SortOrder = o.SortOrder
        }).ToList(),
        CreatedById = q.CreatedById,
        CreatedAt = q.CreatedAt,
        UpdatedAt = q.UpdatedAt
    };

    private static void ValidateQuestionPayload(string content, IReadOnlyCollection<CreateOptionRequest> options)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new AppException("Question content is required.");

        if (options.Any(o => string.IsNullOrWhiteSpace(o.Label) || string.IsNullOrWhiteSpace(o.Content)))
            throw new AppException("Each option must have a label and content.");

        var hasDuplicateLabel = options
            .GroupBy(o => o.Label.Trim(), StringComparer.OrdinalIgnoreCase)
            .Any(group => group.Count() > 1);

        if (hasDuplicateLabel)
            throw new AppException("Option labels must be unique.");
    }

    private async Task EnsureCategoryBelongsToSubjectAsync(Guid? categoryId, Guid subjectId)
    {
        if (!categoryId.HasValue)
            return;

        var category = await _db.QuestionCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == categoryId.Value)
            ?? throw new NotFoundException("Category", categoryId.Value);

        if (category.SubjectId != subjectId)
            throw new AppException("Category does not belong to the question subject.");
    }
}
