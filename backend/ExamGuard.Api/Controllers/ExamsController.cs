using ExamGuard.Api.Security;
using ExamGuard.Core.DTOs.Exam;
using ExamGuard.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/exams")]
public class ExamsController : ControllerBase
{
    private readonly IExamService _examService;
    private readonly ICurrentUserService _currentUser;

    public ExamsController(IExamService examService, ICurrentUserService currentUser)
    {
        _examService = examService;
        _currentUser = currentUser;
    }

    [HttpGet]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<List<ExamDto>>> GetExams()
    {
        Guid? lecturerId = _currentUser.IsAdmin ? null : _currentUser.UserId;
        var exams = await _examService.GetExamsAsync(lecturerId);
        return Ok(exams);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<ExamDto>> GetExam(Guid id)
    {
        var exam = await _examService.GetExamByIdAsync(id, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(exam);
    }

    [HttpPost]
    [Authorize(Policy = AuthorizationPolicies.LecturerOnly)]
    public async Task<ActionResult<ExamDto>> CreateExam([FromBody] CreateExamRequest request)
    {
        var exam = await _examService.CreateExamAsync(request, _currentUser.UserId);
        return CreatedAtAction(nameof(GetExam), new { id = exam.Id }, exam);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<ExamDto>> UpdateExam(Guid id, [FromBody] UpdateExamRequest request)
    {
        var exam = await _examService.UpdateExamAsync(id, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(exam);
    }

    [HttpPatch("{id:guid}/publish")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<IActionResult> PublishExam(Guid id)
    {
        await _examService.PublishExamAsync(id, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(new { message = "Exam published successfully." });
    }

    [HttpPost("{examId:guid}/sessions")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<ExamSessionDto>> CreateSession(Guid examId, [FromBody] CreateSessionRequest request)
    {
        var session = await _examService.CreateSessionAsync(examId, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Created(string.Empty, session);
    }

    [HttpPut("sessions/{sessionId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<ExamSessionDto>> UpdateSession(Guid sessionId, [FromBody] UpdateSessionRequest request)
    {
        var session = await _examService.UpdateSessionAsync(sessionId, request, _currentUser.UserId, _currentUser.IsAdmin);
        return Ok(session);
    }

    [HttpGet("available")]
    [Authorize(Policy = AuthorizationPolicies.StudentOnly)]
    public async Task<ActionResult<List<AvailableSessionDto>>> GetAvailableSessions()
    {
        var sessions = await _examService.GetAvailableSessionsAsync(_currentUser.UserId);
        return Ok(sessions);
    }
}
