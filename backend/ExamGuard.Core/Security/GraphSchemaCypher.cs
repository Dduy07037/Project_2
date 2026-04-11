namespace ExamGuard.Core.Security;

public static class GraphSchemaCypher
{
    public static readonly IReadOnlyList<string> Constraints =
    [
        "CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE",
        "CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE",
        "CREATE CONSTRAINT subject_id IF NOT EXISTS FOR (s:Subject) REQUIRE s.id IS UNIQUE",
        "CREATE CONSTRAINT subject_code IF NOT EXISTS FOR (s:Subject) REQUIRE s.code IS UNIQUE",
        "CREATE CONSTRAINT category_id IF NOT EXISTS FOR (c:Category) REQUIRE c.id IS UNIQUE",
        "CREATE CONSTRAINT question_id IF NOT EXISTS FOR (q:Question) REQUIRE q.id IS UNIQUE",
        "CREATE CONSTRAINT question_option_id IF NOT EXISTS FOR (o:QuestionOption) REQUIRE o.id IS UNIQUE",
        "CREATE CONSTRAINT exam_id IF NOT EXISTS FOR (e:Exam) REQUIRE e.id IS UNIQUE",
        "CREATE CONSTRAINT exam_session_id IF NOT EXISTS FOR (es:ExamSession) REQUIRE es.id IS UNIQUE",
        "CREATE CONSTRAINT refresh_token_hash IF NOT EXISTS FOR (rt:RefreshToken) REQUIRE rt.tokenHash IS UNIQUE",
        "CREATE CONSTRAINT system_setting_key IF NOT EXISTS FOR (ss:SystemSetting) REQUIRE ss.key IS UNIQUE"
    ];
}
