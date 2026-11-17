import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeExcelStatus,
  toExcelStatus,
  parseDeposit,
  normalizeNotes,
  ownedTupleFromDb,
  ownedTupleFromExcel,
  tupleHash,
  classifyPair,
  findColumnIndexes,
  REQUIRED_COLUMNS,
} from '../lib/excel-sync.ts';

test('normalizeExcelStatus maps labels', () => {
  assert.equal(normalizeExcelStatus('Sah'), 'confirmed');
  assert.equal(normalizeExcelStatus('deposit paid'), 'confirmed');
  assert.equal(normalizeExcelStatus('Paid'), 'confirmed');
  assert.equal(normalizeExcelStatus('Pending'), 'pending');
  assert.equal(normalizeExcelStatus('booked'), 'pending');
  assert.equal(normalizeExcelStatus('Baru'), 'pending');
  assert.equal(normalizeExcelStatus('batal'), 'cancelled');
  assert.equal(normalizeExcelStatus('Cancel'), 'cancelled');
  assert.equal(normalizeExcelStatus('xyz'), null);
  assert.equal(normalizeExcelStatus('   '), null);
  assert.equal(normalizeExcelStatus(null), null);
});

test('toExcelStatus maps db statuses', () => {
  assert.equal(toExcelStatus('pending'), 'Pending');
  assert.equal(toExcelStatus('awaiting_payment'), 'Pending');
  assert.equal(toExcelStatus('paid'), 'Confirmed');
  assert.equal(toExcelStatus('confirmed'), 'Confirmed');
  assert.equal(toExcelStatus('failed'), 'Cancelled');
  assert.equal(toExcelStatus('cancelled'), 'Cancelled');
});

test('parseDeposit variants', () => {
  assert.equal(parseDeposit('RM450'), 450);
  assert.equal(parseDeposit('1,200.50'), 1200.5);
  assert.equal(parseDeposit('deposit paid: 450'), 450);
  assert.equal(parseDeposit('RM 1,234.00 deposit'), 1234);
  assert.equal(parseDeposit('abc'), null);
  assert.equal(parseDeposit(''), null);
  assert.equal(parseDeposit(null), null);
});

test('normalizeNotes trims and normalizes CRLF', () => {
  assert.equal(normalizeNotes('  hello\r\nworld\r\n  '), 'hello\nworld');
  assert.equal(normalizeNotes(null), '');
  assert.equal(normalizeNotes(123), '123');
});

test('ownedTupleFromDb and ownedTupleFromExcel', () => {
  const db = ownedTupleFromDb({ payment_status: 'paid', admin_notes: 'ok\r\nline', amount_paid: 100.5 });
  assert.deepEqual(db, { status: 'paid', notes: 'ok\nline', deposit: 100.5 });
  const dbNull = ownedTupleFromDb({ payment_status: null, admin_notes: null, amount_paid: null });
  assert.deepEqual(dbNull, { status: null, notes: null, deposit: 0 });

  const ex = ownedTupleFromExcel('Sah', ' note ', 'RM50');
  assert.deepEqual(ex, { status: 'confirmed', notes: 'note', deposit: 50 });
  assert.equal(ownedTupleFromExcel('xyz', 'n', '50'), null);
  assert.equal(ownedTupleFromExcel('confirmed', 'n', 'abc'), null);
});

test('tupleHash stable with nulls and 2dp', () => {
  const h1 = tupleHash({ status: null, notes: null, deposit: 0 });
  const h2 = tupleHash({ status: null, notes: null, deposit: 0 });
  assert.equal(h1, h2);
  const h3 = tupleHash({ status: 'confirmed', notes: 'hi', deposit: 10 });
  const h4 = tupleHash({ status: 'confirmed', notes: 'hi', deposit: 10.0 });
  assert.equal(h3, h4);
  assert.notEqual(h1, h3);
});

test('classifyPair truth table and storedHash null => db-only', () => {
  assert.equal(classifyPair('a', 'a', 'a'), 'unchanged');
  assert.equal(classifyPair('b', 'a', 'a'), 'db-only');
  assert.equal(classifyPair('a', 'b', 'a'), 'excel-only');
  assert.equal(classifyPair('b', 'c', 'a'), 'both-changed');
  assert.equal(classifyPair('a', 'a', null), 'db-only');
  assert.equal(classifyPair('a', 'b', null), 'db-only');
});

test('findColumnIndexes case/whitespace tolerant with aliases and missing keys', () => {
  const idx = findColumnIndexes(['ID', ' Guest ', 'Phone', 'Unit', 'Room', 'Check In', 'check-out', 'pkg', 'Units', 'Total', 'STATUS', ' Notes', 'Deposit', 'Created']);
  assert.equal(idx.id, 0);
  assert.equal(idx.guest, 1);
  assert.equal(idx.status, 10);
  assert.equal(idx.notes, 11);
  assert.equal(idx['check-in'], 5);
  assert.equal(idx.package, 7);
  assert.equal(idx.deposit, 12);

  const partial = findColumnIndexes(['id', 'status', 'checkin']);
  assert.equal(partial.id, 0);
  assert.equal(partial.status, 1);
  assert.equal(partial['check-in'], 2);
  assert.equal(partial.guest, undefined);
});

test('REQUIRED_COLUMNS defined', () => {
  assert.deepEqual(REQUIRED_COLUMNS, ['id', 'guest', 'check-in', 'check-out', 'status', 'deposit', 'notes', 'created']);
});
