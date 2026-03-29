namespace ExamGuard.Core.DTOs.Question;

// ─── Subject ───
public class SubjectDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Department { get; set; }
    public Guid CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public int ExamCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSubjectRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Department { get; set; }
    public Guid? CreatedById { get; set; }   // Admin assigns lecturer; if null, assigned to current user
}

public class UpdateSubjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Department { get; set; }
    public bool IsActive { get; set; } = true;
}

// ─── Category (Topic) ───
public class CategoryDto
{
    public Guid Id { get; set; }
    public Guid SubjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
}

// ─── Question ───
public class QuestionDto
{
    public Guid Id { get; set; }
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
    public Guid CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class QuestionOptionDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SortOrder { get; set; }
}

public class CreateQuestionRequest
{
    public Guid SubjectId { get; set; }
    public Guid? CategoryId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Difficulty { get; set; } = "Medium";      // Easy | Medium | Hard
    public List<CreateOptionRequest> Options { get; set; } = new();
}

public class CreateOptionRequest
{
    public string Label { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

public class UpdateQuestionRequest
{
    public Guid? CategoryId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Difficulty { get; set; } = "Medium";
    public List<CreateOptionRequest> Options { get; set; } = new();
}

public class QuestionFilterParams
{
    public Guid? SubjectId { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Difficulty { get; set; }
    public string? Search { get; set; }
    public bool? IsActive { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
