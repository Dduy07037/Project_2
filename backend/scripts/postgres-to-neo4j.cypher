// Import USERS (CSV columns: id,email,passwordHash,fullName,role,status,studentCode,department,failedLoginCount,lastLoginAt,createdAt,updatedAt)
LOAD CSV WITH HEADERS FROM 'file:///users.csv' AS row
MERGE (u:User {id: row.id})
SET u.email = row.email,
    u.passwordHash = row.passwordHash,
    u.fullName = row.fullName,
    u.role = row.role,
    u.status = row.status,
    u.studentCode = row.studentCode,
    u.department = row.department,
    u.failedLoginCount = toInteger(coalesce(row.failedLoginCount, '0')),
    u.lastLoginAt = CASE WHEN row.lastLoginAt IS NULL OR row.lastLoginAt = '' THEN NULL ELSE datetime(row.lastLoginAt) END,
    u.createdAt = datetime(row.createdAt),
    u.updatedAt = datetime(row.updatedAt);

// Import SUBJECTS (CSV columns: id,code,name,department,createdById,isActive,createdAt,updatedAt)
LOAD CSV WITH HEADERS FROM 'file:///subjects.csv' AS row
MATCH (owner:User {id: row.createdById})
MERGE (s:Subject {id: row.id})
SET s.code = row.code,
    s.name = row.name,
    s.department = row.department,
    s.isActive = row.isActive = 'true',
    s.createdAt = datetime(row.createdAt),
    s.updatedAt = datetime(row.updatedAt)
MERGE (owner)-[:CREATED_SUBJECT]->(s);

// Import CATEGORIES (CSV columns: id,subjectId,name,createdAt)
LOAD CSV WITH HEADERS FROM 'file:///categories.csv' AS row
MATCH (s:Subject {id: row.subjectId})
MERGE (c:Category {id: row.id})
SET c.name = row.name,
    c.createdAt = datetime(row.createdAt)
MERGE (s)-[:HAS_CATEGORY]->(c);

// Import QUESTIONS (CSV columns: id,subjectId,categoryId,createdById,content,difficulty,isActive,createdAt,updatedAt)
LOAD CSV WITH HEADERS FROM 'file:///questions.csv' AS row
MATCH (s:Subject {id: row.subjectId})
MATCH (u:User {id: row.createdById})
MERGE (q:Question {id: row.id})
SET q.content = row.content,
    q.difficulty = row.difficulty,
    q.isActive = row.isActive = 'true',
    q.createdAt = datetime(row.createdAt),
    q.updatedAt = datetime(row.updatedAt)
MERGE (s)-[:HAS_QUESTION]->(q)
MERGE (u)-[:CREATED_QUESTION]->(q)
FOREACH (_ IN CASE WHEN row.categoryId IS NULL OR row.categoryId = '' THEN [] ELSE [1] END |
  MERGE (c:Category {id: row.categoryId})
  MERGE (q)-[:IN_CATEGORY]->(c)
);

// Import QUESTION OPTIONS (CSV columns: id,questionId,label,content,isCorrect,sortOrder)
LOAD CSV WITH HEADERS FROM 'file:///question_options.csv' AS row
MATCH (q:Question {id: row.questionId})
MERGE (o:QuestionOption {id: row.id})
SET o.label = row.label,
    o.content = row.content,
    o.isCorrect = row.isCorrect = 'true',
    o.sortOrder = toInteger(row.sortOrder)
MERGE (q)-[:HAS_OPTION]->(o);

// Import EXAMS (CSV columns: id,subjectId,createdById,title,description,questionCount,durationMinutes,totalPoints,shuffleQuestions,shuffleOptions,showResultToStudent,status,createdAt,updatedAt)
LOAD CSV WITH HEADERS FROM 'file:///exams.csv' AS row
MATCH (s:Subject {id: row.subjectId})
MATCH (u:User {id: row.createdById})
MERGE (e:Exam {id: row.id})
SET e.title = row.title,
    e.description = row.description,
    e.questionCount = toInteger(row.questionCount),
    e.durationMinutes = toInteger(row.durationMinutes),
    e.totalPoints = toFloat(row.totalPoints),
    e.shuffleQuestions = row.shuffleQuestions = 'true',
    e.shuffleOptions = row.shuffleOptions = 'true',
    e.showResultToStudent = row.showResultToStudent = 'true',
    e.status = row.status,
    e.createdAt = datetime(row.createdAt),
    e.updatedAt = datetime(row.updatedAt)
MERGE (s)-[:HAS_EXAM]->(e)
MERGE (u)-[:CREATED_EXAM]->(e);

// Import EXAM SESSIONS (CSV columns: id,examId,name,startTime,endTime,maxParticipants,password,status,createdAt)
LOAD CSV WITH HEADERS FROM 'file:///exam_sessions.csv' AS row
MATCH (e:Exam {id: row.examId})
MERGE (ses:ExamSession {id: row.id})
SET ses.name = row.name,
    ses.startTime = datetime(row.startTime),
    ses.endTime = datetime(row.endTime),
    ses.maxParticipants = toInteger(coalesce(row.maxParticipants, '0')),
    ses.password = row.password,
    ses.status = row.status,
    ses.createdAt = datetime(row.createdAt)
MERGE (e)-[:HAS_SESSION]->(ses);
