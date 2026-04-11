using ExamGuard.Core.DTOs.Question;
using ExamGuard.Core.DTOs.User;

namespace ExamGuard.Core.Interfaces;

public interface ISubjectService
{
    Task<List<SubjectDto>> GetSubjectsAsync(Guid? lecturerId);
    Task<SubjectDto> GetSubjectByIdAsync(Guid id, Guid currentUserId, bool isAdmin);
    Task<SubjectDto> CreateSubjectAsync(CreateSubjectRequest request, Guid currentUserId);
    Task<SubjectDto> UpdateSubjectAsync(Guid id, UpdateSubjectRequest request, Guid currentUserId, bool isAdmin);
    Task<List<CategoryDto>> GetCategoriesAsync(Guid subjectId, Guid currentUserId, bool isAdmin);
    Task<CategoryDto> CreateCategoryAsync(Guid subjectId, CreateCategoryRequest request, Guid currentUserId, bool isAdmin);
    Task DeleteCategoryAsync(Guid categoryId, Guid currentUserId, bool isAdmin);
}

public interface IQuestionService
{
    Task<PagedResult<QuestionDto>> GetQuestionsAsync(QuestionFilterParams filter, Guid currentUserId, bool isAdmin);
    Task<QuestionDto> GetQuestionByIdAsync(Guid id, Guid currentUserId, bool isAdmin);
    Task<QuestionDto> CreateQuestionAsync(CreateQuestionRequest request, Guid currentUserId);
    Task<QuestionDto> UpdateQuestionAsync(Guid id, UpdateQuestionRequest request, Guid currentUserId, bool isAdmin);
    Task DeleteQuestionAsync(Guid id, Guid currentUserId, bool isAdmin);
}
