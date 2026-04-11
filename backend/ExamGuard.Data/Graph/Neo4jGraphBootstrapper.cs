using ExamGuard.Core.Configuration;
using ExamGuard.Core.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Neo4j.Driver;

namespace ExamGuard.Data.Graph;

public sealed class Neo4jGraphBootstrapper
{
    private readonly IDriver _driver;
    private readonly Neo4jAuraOptions _options;
    private readonly ILogger<Neo4jGraphBootstrapper> _logger;

    public Neo4jGraphBootstrapper(
        IDriver driver,
        IOptions<Neo4jAuraOptions> options,
        ILogger<Neo4jGraphBootstrapper> logger)
    {
        _driver = driver;
        _options = options.Value;
        _logger = logger;
    }

    public async Task InitializeSchemaAsync(CancellationToken cancellationToken = default)
    {
        await using var session = _driver.AsyncSession(config => config.WithDatabase(_options.Database));

        foreach (var constraint in GraphSchemaCypher.Constraints)
        {
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(constraint);
            });
        }

        _logger.LogInformation("Neo4j schema bootstrap completed with {Count} constraints.", GraphSchemaCypher.Constraints.Count);
    }
}
