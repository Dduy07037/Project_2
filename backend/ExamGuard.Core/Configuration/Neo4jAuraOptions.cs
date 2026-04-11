namespace ExamGuard.Core.Configuration;

public sealed class Neo4jAuraOptions
{
    public const string SectionName = "Neo4jAura";

    public string Uri { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Database { get; set; } = "neo4j";
    public int MaxConnectionPoolSize { get; set; } = 100;
    public int ConnectionTimeoutSeconds { get; set; } = 15;
}
