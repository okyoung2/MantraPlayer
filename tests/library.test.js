import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kindOf, sortLibrary, moveItem, isDuplicate, describeAddError } from '../js/library.js';

test('kindOf', () => {
  assert.equal(kindOf('video/mp4', 'a.mp4'), 'video');
  assert.equal(kindOf('audio/mpeg', 'a.mp3'), 'audio');
  assert.equal(kindOf('', '만트라.M4A'), 'audio');
  assert.equal(kindOf('', 'clip.mp4'), 'video');
  assert.equal(kindOf('image/png', 'a.png'), null);
  assert.equal(kindOf('', 'notes.txt'), null);
});

test('sortLibrary: favorites first, newest first within groups', () => {
  const it = (id, favorite, addedAt) => ({ id, favorite, addedAt });
  const input = [it('a', false, 1), it('b', true, 2), it('c', false, 3), it('d', true, 1)];
  const out = sortLibrary(input);
  assert.deepEqual(out.map((x) => x.id), ['b', 'd', 'c', 'a']);
  assert.deepEqual(input.map((x) => x.id), ['a', 'b', 'c', 'd']);
});

test('isDuplicate matches name and size', () => {
  const items = [{ name: 'om.mp4', size: 100 }];
  assert.equal(isDuplicate(items, { name: 'om.mp4', size: 100 }), true);
  assert.equal(isDuplicate(items, { name: 'om.mp4', size: 101 }), false);
});

test('describeAddError', () => {
  const quota = Object.assign(new Error('x'), { name: 'QuotaExceededError' });
  assert.equal(describeAddError(quota, 'big.mp4'), '저장 공간이 부족해요. "big.mp4"을(를) 추가하지 못했어요.');
  assert.equal(describeAddError(new Error('?'), 'a.mp3'), '"a.mp3"을(를) 추가하지 못했어요.');
});

test('kindOf falls back to the extension for generic MIME types', () => {
  assert.equal(kindOf('application/octet-stream', 'om.mp4'), 'video');
  assert.equal(kindOf('application/octet-stream', 'om.m4a'), 'audio');
});

test('sortLibrary follows the saved order inside each favorite group', () => {
  const it = (id, favorite, addedAt) => ({ id, favorite, addedAt });
  const input = [it('a', false, 1), it('b', true, 2), it('c', false, 3), it('d', true, 1)];
  assert.deepEqual(sortLibrary(input, ['a', 'c', 'd', 'b']).map((x) => x.id), ['d', 'b', 'a', 'c']);
});

test('sortLibrary puts files added after the order was saved at the top of their group', () => {
  const it = (id, favorite, addedAt) => ({ id, favorite, addedAt });
  const input = [it('a', false, 1), it('c', false, 3), it('new1', false, 5), it('new2', false, 6)];
  assert.deepEqual(sortLibrary(input, ['a', 'c']).map((x) => x.id), ['new2', 'new1', 'a', 'c']);
});

test('moveItem swaps neighbours and stays inside the favorite group', () => {
  const it = (id, favorite) => ({ id, favorite });
  const sorted = [it('b', true), it('d', true), it('c', false), it('a', false)];
  assert.deepEqual(moveItem(sorted, 0, 1), ['d', 'b', 'c', 'a']);
  assert.deepEqual(moveItem(sorted, 3, -1), ['b', 'd', 'a', 'c']);
  assert.equal(moveItem(sorted, 1, 1), null); // 즐겨찾기 → 일반 묶음으로는 못 넘어간다
  assert.equal(moveItem(sorted, 0, -1), null);
  assert.equal(moveItem(sorted, 3, 1), null);
});
