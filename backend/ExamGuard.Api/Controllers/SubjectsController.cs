using ExamGuard.Core.DTOs.Question;
using ExamGuard.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/subjects")]
[Authorize]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _subjectService;
    private readonly ICurrentUserService _currentUser;

    public SubjectsController(ISubjectService subjectService, ICurrentUserService currentUser)
    {
        _subjectService = subjectService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// List subjects. Admin sees all, Lecturer sees own.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<ActionResult<List<SubjectDto>>> GetSubjects()
    {
        Guid? lecturerId = _currentUser.IsAdmin ? null : _currentUser.UserId;
        var subjects = await _subjectService.GetSubjectsAsync(lecturerId);
        return Ok(subjects);
    }

    /// <summary>
    /// Get subject detail.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<ActionResult<SubjectDto>> GetSubject(Guid id)
    {
        var subject = await _subjectService.GetSubjectByIdAsync(id);
        return Ok(subject);
    }

    /// <summary>
    /// Create subject. Admin only.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubjectDto>> CreateSubject([FromBody] CreateSubjectRequest request)
    {
        var subject = await _subjectService.CreateSubjectAsync(request, _currentUser.UserId);
        return CreatedAtAction(nameof(GetSubject), new { id = subject.Id }, subject);
    }

    /// <summary>
    /// Update subject. Admin or owning lecturer.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<ActionResult<SubjectDto>> UpdateSubject(Guid id, [FromBody] UpdateSubjectRequest request)
    {
        var subject = await _subjectService.UpdateSubjectAsync(id, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(subject);
    }

    /// <summary>
    /// List categories for a subject.
    /// </summary>
    [HttpGet("{subjectId:guid}/categories")]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories(Guid subjectId)
    {
        var categories = await _subjectService.GetCategoriesAsync(subjectId);
        return Ok(categories);
    }

    /// <summary>
    /// Create category in a subject. Owner lecturer or admin.
    /// </summary>
    [HttpPost("{subjectId:guid}/categories")]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<ActionResult<CategoryDto>> CreateCategory(Guid subjectId, [FromBody] CreateCategoryRequest request)
    {
        var category = await _subjectService.CreateCategoryAsync(subjectId, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Created("", category);
    }

    /// <summary>
    /// Delete category. Owner lecturer or admin.
    /// </summary>
    [HttpDelete("categories/{categoryId:guid}")]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<IActionResult> DeleteCategory(Guid categoryId)
    {
        await _subjectService.DeleteCategoryAsync(categoryId, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(new { message = "Xóa chủ đề thành công." });
    }
}
