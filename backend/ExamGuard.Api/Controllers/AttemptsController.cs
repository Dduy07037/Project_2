using ExamGuard.Api.Security;
using ExamGuard.Core.DTOs.Attempt;
using ExamGuard.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/attempts")]
[Authorize]
public class AttemptsController : ControllerBase
{
    private readonly IAttemptService _attemptService;
    private readonly ICurrentUserService _currentUser;

    public AttemptsController(IAttemptService attemptService, ICurrentUserService currentUser)
    {
        _attemptService = attemptService;
        _currentUser = currentUser;
    }

    [HttpPost("start")]
    [Authorize(Policy = AuthorizationPolicies.StudentOnly)]
    public async Task<ActionResult<AttemptDetailDto>> StartAttempt([FromBody] StartAttemptRequest request)
    {
        var detail = await _attemptService.StartAttemptAsync(_currentUser.UserId, request, GetIpAddress(), GetUserAgent());
        return Ok(detail);
    }

    [HttpGet("{attemptId:guid}")]
    public async Task<ActionResult<AttemptDetailDto>> GetAttempt(Guid attemptId)
    {
        var detail = await _attemptService.GetAttemptDetailAsync(attemptId, _currentUser.UserId, _currentUser.IsAdmin, _currentUser.IsLecturer);
        return Ok(detail);
    }

    [HttpPut("{attemptId:guid}/answers/{questionSnapshotId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.StudentOnly)]
    public async Task<ActionResult<AttemptAnswerUpdateDto>> SaveAnswer(Guid attemptId, Guid questionSnapshotId, [FromBody] SaveAnswerRequest request)
    {
        var result = await _attemptService.SaveAnswerAsync(attemptId, questionSnapshotId, _currentUser.UserId, request);
        return Ok(result);
    }

    [HttpPost("{attemptId:guid}/events")]
    [Authorize(Policy = AuthorizationPolicies.StudentOnly)]
    public async Task<ActionResult<AttemptEventResultDto>> LogEvent(Guid attemptId, [FromBody] LogAttemptEventRequest request)
    {
        var result = await _attemptService.LogEventAsync(attemptId, _currentUser.UserId, request, GetIpAddress(), GetUserAgent());
        return Ok(result);
    }

    [HttpPost("{attemptId:guid}/submit")]
    [Authorize(Policy = AuthorizationPolicies.StudentOnly)]
    public async Task<ActionResult<AttemptSummaryDto>> Submit(Guid attemptId, [FromBody] SubmitAttemptRequest request)
    {
        var result = await _attemptService.SubmitAttemptAsync(attemptId, _currentUser.UserId, request, GetIpAddress(), GetUserAgent());
        return Ok(result);
    }

    [HttpGet("history")]
    [Authorize(Policy = AuthorizationPolicies.StudentOnly)]
    public async Task<ActionResult<List<AttemptSummaryDto>>> GetHistory()
    {
        var history = await _attemptService.GetStudentHistoryAsync(_currentUser.UserId);
        return Ok(history);
    }

    [HttpGet("monitoring")]
    [Authorize(Policy = AuthorizationPolicies.AdminOrLecturer)]
    public async Task<ActionResult<List<MonitoringAttemptDto>>> GetMonitoring([FromQuery] MonitoringFilterParams filter)
    {
        var attempts = await _attemptService.GetMonitoringAttemptsAsync(_currentUser.UserId, _currentUser.IsAdmin, filter);
        return Ok(attempts);
    }

    private string? GetIpAddress()
        => HttpContext.Connection.RemoteIpAddress?.ToString();

    private string? GetUserAgent()
        => Request.Headers.UserAgent.ToString();
}
