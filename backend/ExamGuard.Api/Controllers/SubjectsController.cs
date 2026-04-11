using ExamGuard.Api.Security;
using ExamGuard.Core.DTOs.Question;
using ExamGuard.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/subjects")]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _subjectService;
    private readonly ICurrentUserService _currentUser;

    public SubjectsController(ISubjectService subjectService, ICurrentUserService currentUser)
    {
        _subjectService = subjectService;
        _currentUser = currentUser;
    }

    [HttpGet]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<List<SubjectDto>>> GetSubjects()
    {
        Guid? lecturerId = _currentUser.IsAdmin ? null : _currentUser.UserId;
        var subjects = await _subjectService.GetSubjectsAsync(lecturerId);
        return Ok(subjects);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<SubjectDto>> GetSubject(Guid id)
    {
        var subject = await _subjectService.GetSubjectByIdAsync(id, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(subject);
    }

    [HttpPost]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<ActionResult<SubjectDto>> CreateSubject([FromBody] CreateSubjectRequest request)
    {
        var subject = await _subjectService.CreateSubjectAsync(request, _currentUser.UserId);
        return CreatedAtAction(nameof(GetSubject), new { id = subject.Id }, subject);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<SubjectDto>> UpdateSubject(Guid id, [FromBody] UpdateSubjectRequest request)
    {
        var subject = await _subjectService.UpdateSubjectAsync(id, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(subject);
    }

    [HttpGet("{subjectId:guid}/categories")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories(Guid subjectId)
    {
        var categories = await _subjectService.GetCategoriesAsync(subjectId, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(categories);
    }

    [HttpPost("{subjectId:guid}/categories")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<CategoryDto>> CreateCategory(Guid subjectId, [FromBody] CreateCategoryRequest request)
    {
        var category = await _subjectService.CreateCategoryAsync(subjectId, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Created(string.Empty, category);
    }

    [HttpDelete("categories/{categoryId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<IActionResult> DeleteCategory(Guid categoryId)
    {
        await _subjectService.DeleteCategoryAsync(categoryId, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(new { message = "Category deleted successfully." });
    }
}
