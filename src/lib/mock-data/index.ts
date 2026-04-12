import type { User, Subject, Question, Topic, Exam, ExamAttempt, ActivityLog, Notification, SystemSettings, ExamQuestion } from '@/types';

// ─── Users ───
export const mockUsers: User[] = [
    { id: 'u1', email: 'admin@hcmut.edu.vn', name: 'Nguyễn Văn Quản Trị', role: 'admin', status: 'enabled', department: 'CNTT', createdAt: '2025-09-01', lastLogin: '2026-03-19T10:30:00' },
    { id: 'u2', email: 'lecturer1@hcmut.edu.vn', name: 'Trần Thị Minh Anh', role: 'lecturer', status: 'enabled', department: 'Khoa CNTT', createdAt: '2025-09-01', lastLogin: '2026-03-19T08:00:00' },
    { id: 'u3', email: 'lecturer2@hcmut.edu.vn', name: 'Lê Hoàng Phúc', role: 'lecturer', status: 'enabled', department: 'Khoa CNTT', createdAt: '2025-09-15', lastLogin: '2026-03-18T14:20:00' },
    { id: 'u4', email: 'sv001@student.hcmut.edu.vn', name: 'Phạm Đức Duy', role: 'student', studentId: '2112001', status: 'enabled', department: 'CNTT', createdAt: '2025-09-01', lastLogin: '2026-03-19T09:15:00' },
    { id: 'u5', email: 'sv002@student.hcmut.edu.vn', name: 'Ngô Thanh Hằng', role: 'student', studentId: '2112002', status: 'enabled', department: 'CNTT', createdAt: '2025-09-01', lastLogin: '2026-03-18T16:00:00' },
    { id: 'u6', email: 'sv003@student.hcmut.edu.vn', name: 'Võ Minh Khôi', role: 'student', studentId: '2112003', status: 'enabled', department: 'CNTT', createdAt: '2025-09-01', lastLogin: '2026-03-17T11:30:00' },
    { id: 'u7', email: 'sv004@student.hcmut.edu.vn', name: 'Hoàng Thị Lan', role: 'student', studentId: '2112004', status: 'disabled', department: 'CNTT', createdAt: '2025-09-01' },
    { id: 'u8', email: 'sv005@student.hcmut.edu.vn', name: 'Đặng Quốc Bảo', role: 'student', studentId: '2112005', status: 'enabled', department: 'CNTT', createdAt: '2025-09-01', lastLogin: '2026-03-19T07:45:00' },
    { id: 'u9', email: 'lecturer3@hcmut.edu.vn', name: 'Phan Văn Thắng', role: 'lecturer', status: 'locked', department: 'Khoa MMT', createdAt: '2025-10-01' },
    { id: 'u10', email: 'sv006@student.hcmut.edu.vn', name: 'Bùi Ngọc Anh', role: 'student', studentId: '2112006', status: 'enabled', department: 'CNTT', createdAt: '2025-09-01', lastLogin: '2026-03-18T20:00:00' },
];

// ─── Subjects ───
export const mockSubjects: Subject[] = [
    { id: 's1', code: 'CS101', name: 'Nhập môn Lập trình', department: 'Khoa CNTT', lecturerId: 'u2', lecturerName: 'Trần Thị Minh Anh', questionCount: 120, examCount: 3, status: 'enabled', createdAt: '2025-09-01' },
    { id: 's2', code: 'CS201', name: 'Cấu trúc Dữ liệu & Giải thuật', department: 'Khoa CNTT', lecturerId: 'u2', lecturerName: 'Trần Thị Minh Anh', questionCount: 85, examCount: 2, status: 'enabled', createdAt: '2025-09-01' },
    { id: 's3', code: 'CS301', name: 'Cơ sở Dữ liệu', department: 'Khoa CNTT', lecturerId: 'u3', lecturerName: 'Lê Hoàng Phúc', questionCount: 95, examCount: 2, status: 'enabled', createdAt: '2025-09-15' },
    { id: 's4', code: 'CS401', name: 'Mạng Máy tính', department: 'Khoa MMT', lecturerId: 'u9', lecturerName: 'Phan Văn Thắng', questionCount: 60, examCount: 1, status: 'disabled', createdAt: '2025-10-01' },
];

// ─── Topics ───
export const mockTopics: Topic[] = [
    { id: 't1', subjectId: 's1', name: 'Biến và kiểu dữ liệu', questionCount: 25 },
    { id: 't2', subjectId: 's1', name: 'Cấu trúc điều khiển', questionCount: 30 },
    { id: 't3', subjectId: 's1', name: 'Hàm và đệ quy', questionCount: 20 },
    { id: 't4', subjectId: 's1', name: 'Mảng và chuỗi', questionCount: 25 },
    { id: 't5', subjectId: 's1', name: 'Con trỏ', questionCount: 20 },
    { id: 't6', subjectId: 's2', name: 'Danh sách liên kết', questionCount: 20 },
    { id: 't7', subjectId: 's2', name: 'Stack & Queue', questionCount: 15 },
    { id: 't8', subjectId: 's2', name: 'Cây nhị phân', questionCount: 25 },
    { id: 't9', subjectId: 's2', name: 'Đồ thị', questionCount: 25 },
    { id: 't10', subjectId: 's3', name: 'Mô hình quan hệ', questionCount: 30 },
    { id: 't11', subjectId: 's3', name: 'SQL cơ bản', questionCount: 35 },
    { id: 't12', subjectId: 's3', name: 'Chuẩn hóa', questionCount: 30 },
];

// ─── Questions ───
export const mockQuestions: Question[] = [
    {
        id: 'q1', subjectId: 's1', subjectName: 'Nhập môn Lập trình', topicId: 't1', topicName: 'Biến và kiểu dữ liệu',
        content: 'Trong ngôn ngữ C, kiểu dữ liệu nào sau đây dùng để lưu trữ số thực?',
        options: [
            { id: 'o1', label: 'A', content: 'int' },
            { id: 'o2', label: 'B', content: 'float' },
            { id: 'o3', label: 'C', content: 'char' },
            { id: 'o4', label: 'D', content: 'bool' },
        ],
        correctOptionId: 'o2', difficulty: 'easy', createdBy: 'u2', createdAt: '2025-10-01', updatedAt: '2025-10-01', usageCount: 5,
    },
    {
        id: 'q2', subjectId: 's1', subjectName: 'Nhập môn Lập trình', topicId: 't2', topicName: 'Cấu trúc điều khiển',
        content: 'Vòng lặp nào trong C sẽ kiểm tra điều kiện trước khi thực thi phần thân?',
        options: [
            { id: 'o5', label: 'A', content: 'do-while' },
            { id: 'o6', label: 'B', content: 'for' },
            { id: 'o7', label: 'C', content: 'while' },
            { id: 'o8', label: 'D', content: 'Cả B và C' },
        ],
        correctOptionId: 'o8', difficulty: 'medium', createdBy: 'u2', createdAt: '2025-10-05', updatedAt: '2025-10-05', usageCount: 3,
    },
    {
        id: 'q3', subjectId: 's1', subjectName: 'Nhập môn Lập trình', topicId: 't3', topicName: 'Hàm và đệ quy',
        content: 'Hàm đệ quy cần có thành phần nào để tránh lặp vô hạn?',
        options: [
            { id: 'o9', label: 'A', content: 'Biến toàn cục' },
            { id: 'o10', label: 'B', content: 'Điều kiện dừng (base case)' },
            { id: 'o11', label: 'C', content: 'Vòng lặp for' },
            { id: 'o12', label: 'D', content: 'Câu lệnh goto' },
        ],
        correctOptionId: 'o10', difficulty: 'easy', createdBy: 'u2', createdAt: '2025-10-10', updatedAt: '2025-10-10', usageCount: 7,
    },
    {
        id: 'q4', subjectId: 's2', subjectName: 'CTDL & Giải thuật', topicId: 't6', topicName: 'Danh sách liên kết',
        content: 'Ưu điểm chính của danh sách liên kết so với mảng là gì?',
        options: [
            { id: 'o13', label: 'A', content: 'Truy cập ngẫu nhiên nhanh hơn' },
            { id: 'o14', label: 'B', content: 'Chèn/xóa phần tử linh hoạt hơn' },
            { id: 'o15', label: 'C', content: 'Sử dụng ít bộ nhớ hơn' },
            { id: 'o16', label: 'D', content: 'Tìm kiếm nhanh hơn' },
        ],
        correctOptionId: 'o14', difficulty: 'easy', createdBy: 'u2', createdAt: '2025-11-01', updatedAt: '2025-11-01', usageCount: 4,
    },
    {
        id: 'q5', subjectId: 's2', subjectName: 'CTDL & Giải thuật', topicId: 't8', topicName: 'Cây nhị phân',
        content: 'Cây nhị phân tìm kiếm (BST) có đặc điểm gì?',
        options: [
            { id: 'o17', label: 'A', content: 'Nút con trái luôn lớn hơn nút cha' },
            { id: 'o18', label: 'B', content: 'Mỗi nút có tối đa 3 nút con' },
            { id: 'o19', label: 'C', content: 'Nút con trái nhỏ hơn nút cha, nút con phải lớn hơn' },
            { id: 'o20', label: 'D', content: 'Các nút được sắp xếp theo thứ tự breadth-first' },
        ],
        correctOptionId: 'o19', difficulty: 'medium', createdBy: 'u2', createdAt: '2025-11-10', updatedAt: '2025-11-10', usageCount: 6,
    },
];

// ─── Exams ───
export const mockExams: Exam[] = [
    {
        id: 'e1', title: 'Kiểm tra giữa kỳ - Nhập môn Lập trình', subjectId: 's1', subjectName: 'Nhập môn Lập trình',
        lecturerId: 'u2', lecturerName: 'Trần Thị Minh Anh', description: 'Bài kiểm tra giữa kỳ bao gồm các chủ đề: Biến, kiểu dữ liệu, cấu trúc điều khiển, hàm và đệ quy.',
        questionCount: 30, duration: 45, totalPoints: 10, shuffleQuestions: true, shuffleOptions: true, showResult: true,
        status: 'completed',
        sessions: [
            { id: 'es1', examId: 'e1', name: 'Ca 1 - Sáng', startTime: '2026-03-15T08:00:00', endTime: '2026-03-15T09:00:00', maxParticipants: 40, currentParticipants: 38, status: 'completed' },
            { id: 'es2', examId: 'e1', name: 'Ca 2 - Chiều', startTime: '2026-03-15T14:00:00', endTime: '2026-03-15T15:00:00', maxParticipants: 40, currentParticipants: 35, status: 'completed' },
        ],
        createdAt: '2026-03-01', updatedAt: '2026-03-10',
    },
    {
        id: 'e2', title: 'Kiểm tra cuối kỳ - Nhập môn Lập trình', subjectId: 's1', subjectName: 'Nhập môn Lập trình',
        lecturerId: 'u2', lecturerName: 'Trần Thị Minh Anh', description: 'Bài thi cuối kỳ tổng hợp toàn bộ chương trình.',
        questionCount: 50, duration: 90, totalPoints: 10, shuffleQuestions: true, shuffleOptions: true, showResult: false,
        status: 'scheduled',
        sessions: [
            { id: 'es3', examId: 'e2', name: 'Ca thi duy nhất', startTime: '2026-03-25T08:00:00', endTime: '2026-03-25T10:00:00', maxParticipants: 80, currentParticipants: 0, status: 'scheduled' },
        ],
        createdAt: '2026-03-10', updatedAt: '2026-03-15',
    },
    {
        id: 'e3', title: 'Quiz CTDL - Danh sách liên kết', subjectId: 's2', subjectName: 'CTDL & Giải thuật',
        lecturerId: 'u2', lecturerName: 'Trần Thị Minh Anh', description: 'Bài quiz nhanh về danh sách liên kết.',
        questionCount: 15, duration: 20, totalPoints: 5, shuffleQuestions: true, shuffleOptions: false, showResult: true,
        status: 'active',
        sessions: [
            { id: 'es4', examId: 'e3', name: 'Online', startTime: '2026-03-19T14:00:00', endTime: '2026-03-19T16:00:00', maxParticipants: 60, currentParticipants: 22, status: 'active' },
        ],
        createdAt: '2026-03-12', updatedAt: '2026-03-18',
    },
    {
        id: 'e4', title: 'Kiểm tra giữa kỳ - Cơ sở Dữ liệu', subjectId: 's3', subjectName: 'Cơ sở Dữ liệu',
        lecturerId: 'u3', lecturerName: 'Lê Hoàng Phúc', description: 'Kiểm tra kiến thức SQL cơ bản và mô hình quan hệ.',
        questionCount: 25, duration: 40, totalPoints: 10, shuffleQuestions: true, shuffleOptions: true, showResult: true,
        status: 'draft',
        sessions: [],
        createdAt: '2026-03-18', updatedAt: '2026-03-18',
    },
];

// ─── Attempts ───
export const mockAttempts: ExamAttempt[] = [
    {
        id: 'a1', examId: 'e1', sessionId: 'es1', studentId: 'u4', studentName: 'Phạm Đức Duy', studentCode: '2112001',
        startedAt: '2026-03-15T08:01:00', submittedAt: '2026-03-15T08:42:00', score: 8.5, totalQuestions: 30, answeredQuestions: 30, correctAnswers: 26,
        status: 'submitted', submitType: 'manual', flags: [], behaviorLogs: [], timeSpent: 2460,
    },
    {
        id: 'a2', examId: 'e1', sessionId: 'es1', studentId: 'u5', studentName: 'Ngô Thanh Hằng', studentCode: '2112002',
        startedAt: '2026-03-15T08:00:30', submittedAt: '2026-03-15T08:44:50', score: 7.0, totalQuestions: 30, answeredQuestions: 28, correctAnswers: 21,
        status: 'submitted', submitType: 'manual',
        flags: [
            { id: 'f1', type: 'tab_switch', description: 'Rời tab 3 lần trong 5 phút', severity: 'medium', timestamp: '2026-03-15T08:25:00' },
        ],
        behaviorLogs: [
            { id: 'bl1', attemptId: 'a2', event: 'tab_leave', timestamp: '2026-03-15T08:20:10', details: 'Chuyển sang tab khác' },
            { id: 'bl2', attemptId: 'a2', event: 'tab_return', timestamp: '2026-03-15T08:20:25', details: 'Quay lại tab thi' },
            { id: 'bl3', attemptId: 'a2', event: 'tab_leave', timestamp: '2026-03-15T08:22:05', details: 'Chuyển sang tab khác' },
            { id: 'bl4', attemptId: 'a2', event: 'tab_return', timestamp: '2026-03-15T08:22:30', details: 'Quay lại tab thi' },
            { id: 'bl5', attemptId: 'a2', event: 'tab_leave', timestamp: '2026-03-15T08:24:50', details: 'Chuyển sang tab khác' },
            { id: 'bl6', attemptId: 'a2', event: 'tab_return', timestamp: '2026-03-15T08:25:10', details: 'Quay lại tab thi' },
        ],
        timeSpent: 2660,
    },
    {
        id: 'a3', examId: 'e1', sessionId: 'es1', studentId: 'u6', studentName: 'Võ Minh Khôi', studentCode: '2112003',
        startedAt: '2026-03-15T08:00:15', submittedAt: '2026-03-15T08:45:00', score: 3.0, totalQuestions: 30, answeredQuestions: 18, correctAnswers: 9,
        status: 'auto_submitted', submitType: 'auto',
        flags: [
            { id: 'f2', type: 'tab_switch', description: 'Rời tab 8 lần', severity: 'high', timestamp: '2026-03-15T08:30:00' },
            { id: 'f3', type: 'excessive_idle', description: 'Không thao tác trong 10 phút', severity: 'medium', timestamp: '2026-03-15T08:35:00' },
        ],
        behaviorLogs: [
            { id: 'bl7', attemptId: 'a3', event: 'tab_leave', timestamp: '2026-03-15T08:10:00' },
            { id: 'bl8', attemptId: 'a3', event: 'tab_return', timestamp: '2026-03-15T08:10:45' },
            { id: 'bl9', attemptId: 'a3', event: 'tab_leave', timestamp: '2026-03-15T08:12:00' },
            { id: 'bl10', attemptId: 'a3', event: 'tab_return', timestamp: '2026-03-15T08:13:00' },
            { id: 'bl11', attemptId: 'a3', event: 'page_reload', timestamp: '2026-03-15T08:15:00' },
            { id: 'bl12', attemptId: 'a3', event: 'copy_attempt', timestamp: '2026-03-15T08:18:00', details: 'Cố gắng copy nội dung câu hỏi' },
            { id: 'bl13', attemptId: 'a3', event: 'idle_detected', timestamp: '2026-03-15T08:25:00', details: 'Không hoạt động 10 phút' },
        ],
        timeSpent: 2685,
    },
    {
        id: 'a4', examId: 'e1', sessionId: 'es2', studentId: 'u8', studentName: 'Đặng Quốc Bảo', studentCode: '2112005',
        startedAt: '2026-03-15T14:00:10', submittedAt: '2026-03-15T14:38:00', score: 9.0, totalQuestions: 30, answeredQuestions: 30, correctAnswers: 27,
        status: 'submitted', submitType: 'manual',
        flags: [
            { id: 'f4', type: 'fast_completion', description: 'Hoàn thành quá nhanh (38 phút / 45 phút)', severity: 'low', timestamp: '2026-03-15T14:38:00' },
        ],
        behaviorLogs: [], timeSpent: 2270,
    },
    {
        id: 'a5', examId: 'e1', sessionId: 'es2', studentId: 'u10', studentName: 'Bùi Ngọc Anh', studentCode: '2112006',
        startedAt: '2026-03-15T14:01:00', submittedAt: '2026-03-15T14:40:00', score: 6.5, totalQuestions: 30, answeredQuestions: 29, correctAnswers: 20,
        status: 'flagged', submitType: 'manual',
        flags: [
            { id: 'f5', type: 'tab_switch', description: 'Rời tab 5 lần', severity: 'high', timestamp: '2026-03-15T14:20:00' },
            { id: 'f6', type: 'pattern_detected', description: 'Trả lời 10 câu liên tục trong 2 phút', severity: 'medium', timestamp: '2026-03-15T14:35:00' },
        ],
        behaviorLogs: [
            { id: 'bl14', attemptId: 'a5', event: 'tab_leave', timestamp: '2026-03-15T14:10:00' },
            { id: 'bl15', attemptId: 'a5', event: 'tab_return', timestamp: '2026-03-15T14:11:30' },
            { id: 'bl16', attemptId: 'a5', event: 'right_click', timestamp: '2026-03-15T14:15:00' },
            { id: 'bl17', attemptId: 'a5', event: 'tab_leave', timestamp: '2026-03-15T14:18:00' },
            { id: 'bl18', attemptId: 'a5', event: 'tab_return', timestamp: '2026-03-15T14:19:00' },
        ],
        timeSpent: 2340,
    },
];

// ─── Activity Logs ───
export const mockActivityLogs: ActivityLog[] = [
    { id: 'al1', userId: 'u2', userName: 'Trần Thị Minh Anh', userRole: 'lecturer', action: 'Tạo kỳ thi', target: 'Kiểm tra giữa kỳ - Nhập môn Lập trình', timestamp: '2026-03-15T07:30:00' },
    { id: 'al2', userId: 'u4', userName: 'Phạm Đức Duy', userRole: 'student', action: 'Nộp bài thi', target: 'Kiểm tra giữa kỳ - NMLT (Ca 1)', timestamp: '2026-03-15T08:42:00' },
    { id: 'al3', userId: 'u1', userName: 'Nguyễn Văn Quản Trị', userRole: 'admin', action: 'Khóa tài khoản', target: 'Phan Văn Thắng', timestamp: '2026-03-16T10:00:00' },
    { id: 'al4', userId: 'u2', userName: 'Trần Thị Minh Anh', userRole: 'lecturer', action: 'Thêm câu hỏi', target: 'Ngân hàng: Nhập môn Lập trình', details: '5 câu hỏi mới', timestamp: '2026-03-17T14:20:00' },
    { id: 'al5', userId: 'u3', userName: 'Lê Hoàng Phúc', userRole: 'lecturer', action: 'Tạo kỳ thi (nháp)', target: 'Kiểm tra giữa kỳ - CSDL', timestamp: '2026-03-18T09:00:00' },
    { id: 'al6', userId: 'u6', userName: 'Võ Minh Khôi', userRole: 'student', action: 'Tự động nộp bài', target: 'Kiểm tra giữa kỳ - NMLT', details: 'Hết thời gian', timestamp: '2026-03-15T08:45:00' },
    { id: 'al7', userId: 'u2', userName: 'Trần Thị Minh Anh', userRole: 'lecturer', action: 'Gắn cờ attempt', target: 'Bùi Ngọc Anh - NMLT', details: 'Hành vi bất thường', timestamp: '2026-03-16T11:00:00' },
    { id: 'al8', userId: 'u1', userName: 'Nguyễn Văn Quản Trị', userRole: 'admin', action: 'Cập nhật cấu hình', target: 'Giới hạn rời tab: 5 → 3', timestamp: '2026-03-17T08:00:00' },
];

// ─── Notifications ───
export const mockNotifications: Notification[] = [
    { id: 'n1', title: 'Kỳ thi sắp diễn ra', message: 'Kiểm tra cuối kỳ - NMLT sẽ bắt đầu vào 25/03/2026', type: 'info', read: false, createdAt: '2026-03-19T08:00:00', link: '/student/exams/e2' },
    { id: 'n2', title: 'Kết quả đã công bố', message: 'Kết quả bài thi giữa kỳ NMLT đã được công bố', type: 'success', read: false, createdAt: '2026-03-16T10:00:00', link: '/student/exams/e1' },
    { id: 'n3', title: 'Attempt bất thường', message: 'Phát hiện 2 attempt có hành vi đáng chú ý trong ca thi NMLT', type: 'warning', read: true, createdAt: '2026-03-15T16:00:00', link: '/lecturer/exams/e1/flagged' },
    { id: 'n4', title: 'Tài khoản bị khóa', message: 'Tài khoản lecturer3@hcmut.edu.vn đã bị admin khóa', type: 'error', read: true, createdAt: '2026-03-16T10:00:00' },
];

// ─── System Settings ───
export const mockSettings: SystemSettings = {
    siteName: 'ExamGuard - Hệ thống thi trắc nghiệm',
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    tabSwitchWarning: true,
    maxTabSwitches: 3,
    autoSubmitOnTabLimit: false,
    allowCopyPaste: false,
    showResultToStudent: true,
    maintenanceMode: false,
};

// ─── Exam Questions (for exam taking) ───
export const mockExamQuestions: ExamQuestion[] = [
    { id: 'eq1', index: 0, content: 'Trong ngôn ngữ C, kiểu dữ liệu nào sau đây dùng để lưu trữ số thực?', options: [{ id: 'o1', label: 'A', content: 'int' }, { id: 'o2', label: 'B', content: 'float' }, { id: 'o3', label: 'C', content: 'char' }, { id: 'o4', label: 'D', content: 'bool' }] },
    { id: 'eq2', index: 1, content: 'Vòng lặp nào trong C sẽ kiểm tra điều kiện trước khi thực thi phần thân?', options: [{ id: 'o5', label: 'A', content: 'do-while' }, { id: 'o6', label: 'B', content: 'for' }, { id: 'o7', label: 'C', content: 'while' }, { id: 'o8', label: 'D', content: 'Cả B và C' }], selectedOptionId: 'o8' },
    { id: 'eq3', index: 2, content: 'Hàm đệ quy cần có thành phần nào để tránh lặp vô hạn?', options: [{ id: 'o9', label: 'A', content: 'Biến toàn cục' }, { id: 'o10', label: 'B', content: 'Điều kiện dừng (base case)' }, { id: 'o11', label: 'C', content: 'Vòng lặp for' }, { id: 'o12', label: 'D', content: 'Câu lệnh goto' }], selectedOptionId: 'o10', flagged: true },
    { id: 'eq4', index: 3, content: 'Toán tử nào dùng để truy cập địa chỉ của biến trong C?', options: [{ id: 'o13', label: 'A', content: '*' }, { id: 'o14', label: 'B', content: '&' }, { id: 'o15', label: 'C', content: '#' }, { id: 'o16', label: 'D', content: '@' }] },
    { id: 'eq5', index: 4, content: 'Hàm printf() trong C thuộc thư viện nào?', options: [{ id: 'o17', label: 'A', content: 'stdlib.h' }, { id: 'o18', label: 'B', content: 'stdio.h' }, { id: 'o19', label: 'C', content: 'string.h' }, { id: 'o20', label: 'D', content: 'math.h' }], selectedOptionId: 'o18' },
    { id: 'eq6', index: 5, content: 'Kết quả của biểu thức 5 / 2 (với 5 và 2 đều là int) là bao nhiêu?', options: [{ id: 'o21', label: 'A', content: '2.5' }, { id: 'o22', label: 'B', content: '2' }, { id: 'o23', label: 'C', content: '3' }, { id: 'o24', label: 'D', content: '2.0' }] },
    { id: 'eq7', index: 6, content: 'Câu lệnh nào dùng để kết thúc vòng lặp trước thời hạn?', options: [{ id: 'o25', label: 'A', content: 'continue' }, { id: 'o26', label: 'B', content: 'break' }, { id: 'o27', label: 'C', content: 'return' }, { id: 'o28', label: 'D', content: 'exit' }], selectedOptionId: 'o26' },
    { id: 'eq8', index: 7, content: 'Mảng trong C có chỉ số bắt đầu từ?', options: [{ id: 'o29', label: 'A', content: '0' }, { id: 'o30', label: 'B', content: '1' }, { id: 'o31', label: 'C', content: '-1' }, { id: 'o32', label: 'D', content: 'Tùy khai báo' }] },
    { id: 'eq9', index: 8, content: 'Từ khóa "static" trong C dùng để làm gì?', options: [{ id: 'o33', label: 'A', content: 'Khai báo biến hằng' }, { id: 'o34', label: 'B', content: 'Biến tĩnh, giữ giá trị qua các lần gọi hàm' }, { id: 'o35', label: 'C', content: 'Khai báo biến ngoại' }, { id: 'o36', label: 'D', content: 'Tạo con trỏ' }], selectedOptionId: 'o34' },
    { id: 'eq10', index: 9, content: 'Kích thước kiểu "int" trên hệ thống 32-bit thường là bao nhiêu byte?', options: [{ id: 'o37', label: 'A', content: '1' }, { id: 'o38', label: 'B', content: '2' }, { id: 'o39', label: 'C', content: '4' }, { id: 'o40', label: 'D', content: '8' }] },
    { id: 'eq11', index: 10, content: 'Phát biểu nào đúng về con trỏ NULL trong C?', options: [{ id: 'o41', label: 'A', content: 'Trỏ đến vùng nhớ số 0' }, { id: 'o42', label: 'B', content: 'Là con trỏ không trỏ đến đối tượng hợp lệ nào' }, { id: 'o43', label: 'C', content: 'Luôn gây lỗi khi sử dụng' }, { id: 'o44', label: 'D', content: 'Chỉ dùng được với kiểu int' }], selectedOptionId: 'o42' },
    { id: 'eq12', index: 11, content: 'Struct trong C dùng để làm gì?', options: [{ id: 'o45', label: 'A', content: 'Định nghĩa hàm' }, { id: 'o46', label: 'B', content: 'Nhóm các biến có kiểu khác nhau thành một kiểu dữ liệu' }, { id: 'o47', label: 'C', content: 'Tạo vòng lặp' }, { id: 'o48', label: 'D', content: 'Quản lý bộ nhớ' }] },
    { id: 'eq13', index: 12, content: 'Hàm malloc() trả về kiểu gì?', options: [{ id: 'o49', label: 'A', content: 'int' }, { id: 'o50', label: 'B', content: 'void*' }, { id: 'o51', label: 'C', content: 'char*' }, { id: 'o52', label: 'D', content: 'float' }], selectedOptionId: 'o50', flagged: true },
    { id: 'eq14', index: 13, content: 'Toán tử sizeof trong C trả về gì?', options: [{ id: 'o53', label: 'A', content: 'Giá trị của biến' }, { id: 'o54', label: 'B', content: 'Kích thước bộ nhớ tính bằng byte' }, { id: 'o55', label: 'C', content: 'Địa chỉ bộ nhớ' }, { id: 'o56', label: 'D', content: 'Số phần tử mảng' }] },
    { id: 'eq15', index: 14, content: 'Phát biểu nào đúng về hàm main() trong C?', options: [{ id: 'o57', label: 'A', content: 'Không bắt buộc có' }, { id: 'o58', label: 'B', content: 'Là hàm đầu tiên được thực thi khi chạy chương trình' }, { id: 'o59', label: 'C', content: 'Có thể khai báo nhiều lần' }, { id: 'o60', label: 'D', content: 'Chỉ trả về void' }], selectedOptionId: 'o58' },
];

// ─── Current User (for simulating logged-in state) ───
export const mockCurrentUser: User = mockUsers[1]; // Lecturer by default
