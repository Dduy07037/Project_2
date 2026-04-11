$ErrorActionPreference = "Stop"

param(
    [string]$ConnectionString = "Host=localhost;Port=5432;Database=online_exam_db;Username=postgres;Password=postgres",
    [string]$OutputDir = ".\csv"
)

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$queries = @{
    "users" = "COPY (SELECT * FROM ""Users"") TO STDOUT WITH CSV HEADER"
    "subjects" = "COPY (SELECT * FROM ""Subjects"") TO STDOUT WITH CSV HEADER"
    "categories" = "COPY (SELECT * FROM ""QuestionCategories"") TO STDOUT WITH CSV HEADER"
    "questions" = "COPY (SELECT * FROM ""Questions"") TO STDOUT WITH CSV HEADER"
    "question_options" = "COPY (SELECT * FROM ""QuestionOptions"") TO STDOUT WITH CSV HEADER"
    "exams" = "COPY (SELECT * FROM ""Exams"") TO STDOUT WITH CSV HEADER"
    "exam_sessions" = "COPY (SELECT * FROM ""ExamSessions"") TO STDOUT WITH CSV HEADER"
}

foreach ($name in $queries.Keys) {
    $file = Join-Path $OutputDir "$name.csv"
    $query = $queries[$name]
    psql "$ConnectionString" -c "$query" > $file
    Write-Host "Exported $name -> $file"
}

Write-Host "Export complete. Copy CSVs into Neo4j import directory and run postgres-to-neo4j.cypher."
