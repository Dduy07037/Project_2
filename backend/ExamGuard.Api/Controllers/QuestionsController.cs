using ExamGuard.Core.DTOs.Question;
using ExamGuard.Core.DTOs.User;
using ExamGuard.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/questions")]
[Authorize(Roles = "Admin,Lecturer")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;
    private readonly ICurrentUserService _currentUser;

    public QuestionsController(IQuestionService questionService, ICurrentUserService currentUser)
    {
        _questionService = questionService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// List questions with filters. Lecturer sees own subjects only.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<QuestionDto>>> GetQuestions([FromQuery] QuestionFilterParams filter)
    {
        var result = await _questionService.GetQuestionsAsync(filter, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(result);
    }

    /// <summary>
    /// Get question detail with options.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<QuestionDto>> GetQuestion(Guid id)
    {
        var question = await _questionService.GetQuestionByIdAsync(id, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(question);
    }

    /// <summary>
    /// Create question with options. Lecturer must own the subject.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Lecturer")]
    public async Task<ActionResult<QuestionDto>> CreateQuestion([FromBody] CreateQuestionRequest request)
    {
        var question = await _questionService.CreateQuestionAsync(request, _currentUser.UserId);
        return CreatedAtAction(nameof(GetQuestion), new { id = question.Id }, question);
    }

    /// <summary>
    /// Update question and replace options. Owner or admin.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<QuestionDto>> UpdateQuestion(Guid id, [FromBody] UpdateQuestionRequest request)
    {
        var question = await _questionService.UpdateQuestionAsync(id, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(question);
    }

    /// <summary>
    /// Soft-delete question. Owner or admin.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteQuestion(Guid id)
    {
        await _questionService.DeleteQuestionAsync(id, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(new { message = "Câu hỏi đã được ẩn." });
    }
}
