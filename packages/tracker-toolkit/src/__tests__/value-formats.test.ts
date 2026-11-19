import assert from 'node:assert/strict';
import {test} from 'node:test';
import {inferDateFormat, inferSizeFormat} from '../value-formats.ts';

test('numeric date order requires evidence from values or a regional locale', () => {
  assert.equal(inferDateFormat(['03/04/2026', '05/06/2026']).status, 'ambiguous');
  assert.equal(inferDateFormat(['03/04/2026', '17/06/2026']).kind, 'dmy');
  assert.equal(inferDateFormat(['04/17/2026', '05/19/2026']).kind, 'mdy');
  assert.equal(inferDateFormat(['03/04/2026'], 'en-US').kind, 'mdy');
  assert.equal(inferDateFormat(['03/04/2026'], 'ru').kind, 'dmy');
  assert.equal(inferDateFormat(['17/04/2026', '05/19/2026']).status, 'ambiguous');
});

test('timestamps retain their precision and explicit timezone', () => {
  assert.equal(inferDateFormat(['1763395200']).kind, 'unix-seconds');
  assert.equal(inferDateFormat(['1763395200123']).kind, 'unix-milliseconds');
  assert.equal(inferDateFormat(['2026-11-17T10:20:30+03:00']).kind, 'iso8601-zone');
  assert.equal(inferDateFormat(['2026-11-17 10:20']).kind, 'ymd');
});

test('named and relative dates are recognized independently of numeric ordering', () => {
  assert.equal(inferDateFormat(['Oct 30, 2026']).kind, 'named-month-first');
  assert.equal(inferDateFormat(['17 ноября 2026']).kind, 'named-day-first');
  assert.equal(inferDateFormat(['сегодня 10:20', 'вчера 08:00']).kind, 'relative-day');
  assert.equal(inferDateFormat(['unknown date']).status, 'unsupported');
  assert.equal(inferDateFormat(['14:20 17-04-26', '08:30 25-04-26']).kind, 'time-dmy');
});

test('size formats handle decimal markers, grouping and explicit binary units', () => {
  assert.equal(inferSizeFormat(['1,5 GiB', '2,25 MiB']).status, 'detected');
  assert.equal(inferSizeFormat(['1,5 ГиБ']).unitBase, 1024);
  assert.equal(inferSizeFormat(['1,234.5 MiB']).status, 'detected');
  assert.equal(inferSizeFormat(['1.234,5 MiB']).status, 'detected');
  assert.equal(inferSizeFormat(['1,234 MiB']).status, 'ambiguous');
  assert.equal(inferSizeFormat(['1.25 GiB', '2,5 GiB']).status, 'ambiguous');
});

test('automatic size setup avoids guessing when the same mark groups digits and marks decimals', () => {
  assert.equal(inferSizeFormat(['1.234.567 B', '1.5 MiB']).status, 'ambiguous');
  assert.equal(inferSizeFormat(['1,234,567 B', '1,5 MiB']).status, 'ambiguous');
  assert.equal(inferSizeFormat(['1.234.567 B', '1,5 MiB']).status, 'detected');
  assert.equal(inferSizeFormat(['1,234,567 B', '1.5 MiB']).status, 'detected');
});

test('byte counts and conventional unit bases are reported explicitly', () => {
  assert.equal(inferSizeFormat(['1048576']).kind, 'bytes');
  assert.equal(inferSizeFormat(['1 024 bytes']).kind, 'bytes-with-unit');
  assert.equal(inferSizeFormat(['1.5 GB']).unitBase, 1024);
  assert.ok(inferSizeFormat(['1.5 GB']).assumption);
  assert.equal(inferSizeFormat(['fast download']).status, 'unsupported');
});

test('missing values do not obscure a format, while invalid calendar values are rejected', () => {
  assert.equal(inferDateFormat(['—', '', '17/04/2026']).kind, 'dmy');
  assert.equal(inferSizeFormat(['—', '1,5 GiB']).status, 'detected');
  for (const value of ['2026-02-30', '31/04/2026', '2026-11-17T25:00:00Z'])
    assert.equal(inferDateFormat([value]).kind, 'invalid-date', value);
  assert.equal(inferDateFormat(['2024-02-29']).status, 'detected');
  assert.equal(inferSizeFormat(['-1.5 GiB']).kind, 'invalid-size');
  assert.equal(inferDateFormat(['today 10:20', '17/04/2026']).kind, 'relative-dmy');
  assert.equal(inferDateFormat(['17.04.2026 в 10:20', 'вчера в 08:30']).kind, 'relative-dmy');
});
