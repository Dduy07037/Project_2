using ExamGuard.Core.DTOs.Exam;
using ExamGuard.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/exams")]
[Authorize]
public class ExamsController : ControllerBase
{
    private readonly IExamService _examService;
    private readonly ICurrentUserService _currentUser;

    public ExamsController(IExamService examService, ICurrentUserService currentUser)
    {
        _examService = examService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// List exams. Admin sees all, Lecturer sees own.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<ActionResult<List<ExamDto>>> GetExams()
    {
        Guid? lecturerId = _currentUser.IsAdmin ? null : _currentUser.UserId;
        var exams = await _examService.GetExamsAsync(lecturerId);
        return Ok(exams);
    }

    /// <summary>
    /// Get exam detail with sessions.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<ActionResult<ExamDto>> GetExam(Guid id)
    {
        var exam = await _examService.GetExamByIdAsync(id, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(exam);
    }

    /// <summary>
    /// Create exam (Draft). Lecturer must own the subject.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Lecturer")]
    public async Task<ActionResult<ExamDto>> CreateExam([FromBody] CreateExamRequest request)
    {
        var exam = await _examService.CreateExamAsync(request, _currentUser.UserId);
        return CreatedAtAction(nameof(GetExam), new { id = exam.Id }, exam);
    }

    /// <summary>
    /// Update exam (Draft only).
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<ActionResult<ExamDto>> UpdateExam(Guid id, [FromBody] UpdateExamRequest request)
    {
        var exam = await _examService.UpdateExamAsync(id, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(exam);
    }

    /// <summary>
    /// Publish exam: Draft → Published. Validates question bank + sessions.
    /// </summary>
    [HttpPatch("{id:guid}/publish")]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<IActionResult> PublishExam(Guid id)
    {
        await _examService.PublishExamAsync(id, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(new { message = "Kỳ thi đã được publish thành công." });
    }

    /// <summary>
    /// Create session for an exam.
    /// </summary>
    [HttpPost("{examId:guid}/sessions")]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<ActionResult<ExamSessionDto>> CreateSession(Guid examId, [FromBody] CreateSessionRequest request)
    {
        var session = await _examService.CreateSessionAsync(examId, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Created("", session);
    }

    /// <summary>
    /// Update session (scheduled only).
    /// </summary>
    [HttpPut("sessions/{sessionId:guid}")]
    [Authorize(Roles = "Admin,Lecturer")]
    public async Task<ActionResult<ExamSessionDto>> UpdateSession(Guid sessionId, [FromBody] UpdateSessionRequest request)
    {
        var session = await _examService.UpdateSessionAsync(sessionId, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(session);
    }

    /// <summary>
    /// Student: list available exam sessions.
    /// </summary>
    [HttpGet("available")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<List<AvailableSessionDto>>> GetAvailableSessions()
    {
        var sessions = await _examService.GetAvailableSessionsAsync(_currentUser.UserId);
        return Ok(sessions);
    }
}
