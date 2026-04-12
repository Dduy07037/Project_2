using ExamGuard.Api.Security;
using ExamGuard.Core.DTOs.Activity;
using ExamGuard.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/activity")]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivityController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ActivityItemDto>>> GetActivity([FromQuery] int limit = 100)
    {
        var items = await _activityService.GetRecentActivityAsync(limit);
        return Ok(items);
    }
}
