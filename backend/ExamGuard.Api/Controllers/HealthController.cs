using Microsoft.AspNetCore.Mvc;

namespace ExamGuard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Health check endpoint — verifies API is running.
    /// </summary>
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "healthy",
            service = "ExamGuard API",
            timestamp = DateTime.UtcNow,
            version = "1.0.0"
        });
    }
}
