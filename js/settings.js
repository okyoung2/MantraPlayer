export const PRESETS = [1, 3, 9, 11, 27, 54, 108];
export const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
export const MAX_COUNT = 9999;
export const RATE_MIN = 0.5;
export const RATE_MAX = 3;

// count: null 은 무한 반복(JSON 으로 저장해야 해서 Infinity 를 쓰지 않는다).
export const DEFAULT_SETTINGS = Object.freeze({
  count: 108,
  corner: 'top-right',
  lastAlert: true,
  doneAlert: true,
  rate: 1,
});

// 0.1 단위로 맞추고 0.5~3 배속 안으로 자른다.
export function clampRate(r) {
  const n = Number(r);
  if (r === null || r === undefined || !Number.isFinite(n)) return 1;
  return Math.min(RATE_MAX, Math.max(RATE_MIN, Math.round(n * 10) / 10));
}

export function formatRate(r) {
  return `${clampRate(r).toFixed(1)}×`;
}

export function parseCustomCount(text) {
  const t = String(text).trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n >= 1 && n <= MAX_COUNT ? n : null;
}

// 파일별 설정 → 최근 설정 → 기본값 순. 빠진 키는 기본값으로 채운다.
// 배속은 파일마다 따로라서 다른 파일의 최근 설정에서 가져오지 않는다.
export function resolveSettings(itemSettings, lastUsed) {
  let base = itemSettings;
  if (!base && lastUsed) {
    const { rate, ...rest } = lastUsed;
    base = rest;
  }
  const s = { ...DEFAULT_SETTINGS, ...(base ?? {}) };
  s.rate = clampRate(s.rate);
  return s;
}

export function targetOf(settings) {
  return settings.count ?? Infinity;
}

export const CORNER_ARROWS = Object.freeze({
  'top-left': '↖',
  'top-right': '↗',
  'bottom-left': '↙',
  'bottom-right': '↘',
});

// 목록에 보여 줄 한 줄 요약.
export function describeSettings(s) {
  const onOff = (v) => (v ? 'ON' : 'OFF');
  const count = s.count === null ? '무한 반복' : `${s.count}회`;
  const rate = s.rate && s.rate !== 1 ? ` · ${formatRate(s.rate)}` : '';
  return `${count}${rate} · ${CORNER_ARROWS[s.corner]} · 🔔 마지막 ${onOff(s.lastAlert)} · 완료 ${onOff(s.doneAlert)}`;
}
