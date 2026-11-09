const VIDEO_EXT = ['mp4', 'm4v', 'mov', '3gp', 'webm', 'mkv'];
const AUDIO_EXT = ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'oga', 'opus', 'amr', 'flac'];

// MIME 우선, video/audio 가 아니면(빈 값, octet-stream 등) 확장자로 판별한다.
export function kindOf(mimeType, fileName) {
  if (mimeType?.startsWith('video/')) return 'video';
  if (mimeType?.startsWith('audio/')) return 'audio';
  const ext = String(fileName).split('.').pop().toLowerCase();
  if (VIDEO_EXT.includes(ext)) return 'video';
  if (AUDIO_EXT.includes(ext)) return 'audio';
  return null;
}

// 즐겨찾기 먼저. 각 묶음 안에서는 사용자가 정한 순서(order: 파일 id 목록)를 따르고,
// 순서를 정한 뒤에 새로 추가한 파일은 묶음 맨 위에 최근 추가순으로 놓는다.
export function sortLibrary(items, order = []) {
  const rank = new Map(order.map((id, i) => [id, i]));
  const r = (it) => (rank.has(it.id) ? rank.get(it.id) : -1);
  return [...items].sort((a, b) =>
    (b.favorite === true) - (a.favorite === true)
    || r(a) - r(b)
    || b.addedAt - a.addedAt);
}

// 정렬된 목록에서 index 의 파일을 한 칸 옮긴 새 순서(id 목록). 즐겨찾기 묶음 경계는 넘지 않는다.
// 옮길 수 없으면 null.
export function moveItem(sorted, index, delta) {
  const to = index + delta;
  if (to < 0 || to >= sorted.length) return null;
  if ((sorted[index].favorite === true) !== (sorted[to].favorite === true)) return null;
  const ids = sorted.map((it) => it.id);
  [ids[index], ids[to]] = [ids[to], ids[index]];
  return ids;
}

export function isDuplicate(items, file) {
  return items.some((it) => it.name === file.name && it.size === file.size);
}

export function describeAddError(err, fileName) {
  const base = `"${fileName}"을(를) 추가하지 못했어요.`;
  return err?.name === 'QuotaExceededError' ? `저장 공간이 부족해요. ${base}` : base;
}
