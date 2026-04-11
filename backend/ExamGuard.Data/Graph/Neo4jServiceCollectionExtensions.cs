using ExamGuard.Core.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Neo4j.Driver;

namespace ExamGuard.Data.Graph;

public static class Neo4jServiceCollectionExtensions
{
    public static bool IsNeo4jAuraConfigured(Neo4jAuraOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.Uri) ||
            string.IsNullOrWhiteSpace(options.Username) ||
            string.IsNullOrWhiteSpace(options.Password))
            return false;

        if (options.Uri.Contains("your-instance", StringComparison.OrdinalIgnoreCase))
            return false;

        if (options.Password.StartsWith("CHANGE_ME", StringComparison.Ordinal))
            return false;

        return true;
    }

    public static IServiceCollection AddNeo4jAura(this IServiceCollection services, IConfiguration configuration)
    {
        var section = configuration.GetSection(Neo4jAuraOptions.SectionName);
        var options = new Neo4jAuraOptions();
        section.Bind(options);
        services.AddSingleton<IOptions<Neo4jAuraOptions>>(Options.Create(options));

        if (!IsNeo4jAuraConfigured(options))
            return services;

        services.AddSingleton<IDriver>(_ =>
            GraphDatabase.Driver(
                options.Uri,
                AuthTokens.Basic(options.Username, options.Password),
                builder => builder
                    .WithMaxConnectionPoolSize(options.MaxConnectionPoolSize)
                    .WithConnectionTimeout(TimeSpan.FromSeconds(options.ConnectionTimeoutSeconds))));

        services.AddScoped<Neo4jGraphBootstrapper>();
        return services;
    }
}
