import type { AttemptEventDto, AttemptSummaryDto } from './api/exam-guard';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';

interface LabelMeta {
  key: string;
  label: string;
  variant: BadgeVariant;
}

function fallbackLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildMetaMap(entries: Array<[string, Omit<LabelMeta, 'key'>]>): Record<string, LabelMeta> {
  return Object.fromEntries(entries.map(([key, value]) => [key, { key, ...value }]));
}

const attemptStatusMap = buildMetaMap([
  ['in_progress', { label: 'Đang làm bài', variant: 'info' }],
  ['submitted', { label: 'Đã nộp bài', variant: 'success' }],
  ['auto_submitted', { label: 'Tự động nộp', variant: 'warning' }],
  ['flagged', { label: 'Cần xem xét', variant: 'danger' }],
]);

const submitTypeMap = buildMetaMap([
  ['manual', { label: 'Thủ công', variant: 'success' }],
  ['auto', { label: 'Tự động', variant: 'warning' }],
  ['forced', { label: 'Bắt buộc', variant: 'danger' }],
]);

const examStatusMap = buildMetaMap([
  ['draft', { label: 'Nháp', variant: 'secondary' }],
  ['published', { label: 'Đã xuất bản', variant: 'info' }],
  ['scheduled', { label: 'Đã lên lịch', variant: 'info' }],
  ['active', { label: 'Đang mở', variant: 'success' }],
  ['completed', { label: 'Đã kết thúc', variant: 'outline' }],
  ['archived', { label: 'Lưu trữ', variant: 'secondary' }],
]);

const sessionStatusMap = buildMetaMap([
  ['draft', { label: 'Nháp', variant: 'secondary' }],
  ['scheduled', { label: 'Sắp diễn ra', variant: 'info' }],
  ['active', { label: 'Đang mở', variant: 'success' }],
  ['completed', { label: 'Đã đóng', variant: 'outline' }],
  ['locked', { label: 'Đã khóa', variant: 'danger' }],
  ['inactive', { label: 'Tạm ẩn', variant: 'secondary' }],
]);

const attemptEventMap = buildMetaMap([
  ['exam_start', { label: 'Bắt đầu bài thi', variant: 'info' }],
  ['exam_submit', { label: 'Nộp bài', variant: 'success' }],
  ['tab_leave', { label: 'Rời tab', variant: 'warning' }],
  ['tab_return', { label: 'Quay lại tab', variant: 'info' }],
  ['page_reload', { label: 'Tải lại trang', variant: 'warning' }],
  ['copy_attempt', { label: 'Copy bị chặn', variant: 'danger' }],
  ['paste_attempt', { label: 'Paste bị chặn', variant: 'danger' }],
  ['right_click', { label: 'Chuột phải bị chặn', variant: 'danger' }],
  ['idle_detected', { label: 'Không hoạt động', variant: 'warning' }],
  ['resume_attempt', { label: 'Tiếp tục bài thi', variant: 'info' }],
  ['concurrent_login', { label: 'Đăng nhập đồng thời', variant: 'danger' }],
  ['answer_changed', { label: 'Đổi đáp án', variant: 'secondary' }],
  ['window_blur', { label: 'Mất focus cửa sổ', variant: 'warning' }],
  ['window_focus', { label: 'Quay lại cửa sổ', variant: 'info' }],
]);

export function normalizeLabelKey(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function getMeta(map: Record<string, LabelMeta>, value: string | null | undefined, fallbackVariant: BadgeVariant): LabelMeta {
  const key = normalizeLabelKey(value);
  return map[key] ?? {
    key,
        label: value ? fallbackLabel(value) : 'Không xác định',
        variant: fallbackVariant,
    };
}

export function getAttemptStatusMeta(status: string | null | undefined): LabelMeta {
  return getMeta(attemptStatusMap, status, 'secondary');
}

export function getSubmitTypeMeta(submitType: string | null | undefined): LabelMeta {
  return getMeta(submitTypeMap, submitType, 'secondary');
}

export function getExamStatusMeta(status: string | null | undefined): LabelMeta {
  return getMeta(examStatusMap, status, 'secondary');
}

export function getSessionStatusMeta(status: string | null | undefined): LabelMeta {
  return getMeta(sessionStatusMap, status, 'secondary');
}

export function getAttemptEventMeta(eventType: string | null | undefined): LabelMeta {
  return getMeta(attemptEventMap, eventType, 'secondary');
}

function mapFlagReason(reason: string): string {
  const normalized = reason.trim();
  const lowered = normalized.toLowerCase();

  if (!normalized) {
    return '';
  }

  if (lowered.includes('rapid answers detected')) {
    return 'Trả lời quá nhanh';
  }

  if (lowered.includes('auto-submitted due to tab switch limit')) {
    return 'Tự động nộp do vượt giới hạn rời tab';
  }

  if (lowered.includes('tab switch count reached')) {
    return 'Vượt giới hạn rời tab';
  }

  if (lowered.includes('browser reload detected') || lowered.includes('pagereload')) {
    return 'Tải lại trang trong khi thi';
  }

  if (lowered.includes('copy blocked') || lowered.includes('copyattempt')) {
    return 'Thử copy nội dung';
  }

  if (lowered.includes('paste blocked') || lowered.includes('pasteattempt')) {
    return 'Thử paste nội dung';
  }

  if (lowered.includes('context menu blocked') || lowered.includes('rightclick')) {
    return 'Thử mở menu chuột phải';
  }

  if (lowered.includes('concurrentlogin')) {
    return 'Đăng nhập đồng thời';
  }

  return normalized;
}

export function getFlagReasonLabels(flagReason: string | null | undefined): string[] {
  if (!flagReason) {
    return [];
  }

  return Array.from(
    new Set(
      flagReason
        .split(';')
        .map((item) => mapFlagReason(item))
        .filter(Boolean),
    ),
  );
}

export function getAttemptFlagLabels(attempt: Pick<AttemptSummaryDto, 'flagReason' | 'tabSwitchCount' | 'reloadCount' | 'isFlagged'>): string[] {
  const labels = getFlagReasonLabels(attempt.flagReason);

  if (attempt.tabSwitchCount > 0 && !labels.includes('Vượt giới hạn rời tab')) {
    labels.push(`${attempt.tabSwitchCount} lần rời tab`);
  }

  if (attempt.reloadCount > 0 && !labels.includes('Tải lại trang trong khi thi')) {
    labels.push(`${attempt.reloadCount} lần tải lại trang`);
  }

  if (!labels.length && attempt.isFlagged) {
    labels.push('Cần xem xét thêm');
  }

  return labels;
}

export function getAttemptEventDescription(event: Pick<AttemptEventDto, 'eventType' | 'details'>): string {
  const key = normalizeLabelKey(event.eventType);
  const details = event.details?.trim();

  switch (key) {
    case 'exam_start':
      return details?.startsWith('Session ')
        ? `Vào ${details.replace(/^Session\s+/i, 'ca thi ')}.`
        : 'Sinh viên bắt đầu bài thi.';
    case 'exam_submit':
      return details
        ? `Bài thi được nộp theo cách ${getSubmitTypeMeta(details).label.toLowerCase()}.`
        : 'Bài thi đã được nộp.';
    case 'tab_leave':
      return 'Người làm bài rời khỏi tab thi.';
    case 'tab_return':
      return 'Người làm bài quay lại tab thi.';
    case 'page_reload':
      return 'Trình duyệt tải lại trang thi.';
    case 'copy_attempt':
      return 'Hệ thống đã chặn thao tác copy.';
    case 'paste_attempt':
      return 'Hệ thống đã chặn thao tác paste.';
    case 'right_click':
      return 'Hệ thống đã chặn menu chuột phải.';
    case 'idle_detected':
      return 'Phát hiện trạng thái không hoạt động.';
    case 'resume_attempt':
      return 'Sinh viên tiếp tục bài thi sau khi quay lại.';
    case 'concurrent_login':
      return 'Phát hiện đăng nhập đồng thời.';
    case 'answer_changed':
      return details?.startsWith('QuestionSnapshot:')
        ? 'Sinh viên đổi đáp án ở một câu hỏi.'
        : 'Sinh viên đổi đáp án.';
    case 'window_blur':
      return 'Cửa sổ thi bị mất focus.';
    case 'window_focus':
      return 'Cửa sổ thi được focus trở lại.';
    default:
      return details || getAttemptEventMeta(event.eventType).label;
  }
}

export function countAttemptEvents(events: Array<Pick<AttemptEventDto, 'eventType'>> | undefined, eventTypes: string[]): number {
  if (!events?.length) {
    return 0;
  }

  const allowedKeys = new Set(eventTypes.map((item) => normalizeLabelKey(item)));
  return events.reduce((total, event) => total + (allowedKeys.has(normalizeLabelKey(event.eventType)) ? 1 : 0), 0);
}
