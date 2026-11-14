import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../data/questions/index';
import {
  createInitialProgress,
  solveLevel,
  spendHint,
  skipLevelProgress,
  evaluateKeypadAnswer,
  evaluateSequenceTap,
  isLevelUnlocked,
  sanitizeProgress,
  checkDistanceOverlap,
  isDraggedAway,
  TOTAL_LEVELS,
} from './rules';

test('all 250 questions exist, have sequential IDs 1..250, and unique prompts', () => {
  assert.equal(QUESTIONS.length, 250);
  const seenPrompts = new Set<string>();

  QUESTIONS.forEach((q, idx) => {
    const expectedId = idx + 1;
    assert.equal(q.id, expectedId, `Expected ID ${expectedId}, got ${q.id}`);
    assert.ok(q.prompt.trim().length > 5, `Empty prompt on question ${q.id}`);
    assert.ok(q.hint.trim().length > 3, `Empty hint on question ${q.id}`);
    assert.ok(q.explanation.trim().length > 3, `Empty explanation on question ${q.id}`);

    const normalizedPrompt = q.prompt.trim().toLowerCase();
    assert.equal(
      seenPrompts.has(normalizedPrompt),
      false,
      `Duplicate prompt found at question ${q.id}: ${q.prompt}`
    );
    seenPrompts.add(normalizedPrompt);
  });
});

test('every question has valid solvable configuration for its mechanic', () => {
  for (const q of QUESTIONS) {
    const itemIds = new Set((q.items ?? []).map((i) => i.id));

    switch (q.mechanic) {
      case 'choice': {
        assert.ok(q.options && q.options.length >= 2, `Q${q.id} choice needs >=2 options`);
        assert.ok(
          q.options.some((o) => o.isCorrect === true),
          `Q${q.id} choice missing correct option`
        );
        break;
      }
      case 'tap-target': {
        assert.ok(q.targetId && itemIds.has(q.targetId), `Q${q.id} tap-target missing targetId`);
        break;
      }
      case 'drag-to-target': {
        assert.ok(q.dragSourceId && itemIds.has(q.dragSourceId), `Q${q.id} missing dragSourceId`);
        assert.ok(q.targetId && itemIds.has(q.targetId), `Q${q.id} missing targetId`);
        if (q.prerequisiteTapId) {
          assert.ok(itemIds.has(q.prerequisiteTapId), `Q${q.id} missing prerequisiteTapId`);
        }
        break;
      }
      case 'drag-away': {
        assert.ok(q.targetId && itemIds.has(q.targetId), `Q${q.id} drag-away missing targetId`);
        break;
      }
      case 'tap-sequence': {
        assert.ok(q.sequenceIds && q.sequenceIds.length >= 2, `Q${q.id} tap-sequence needs >=2`);
        for (const sid of q.sequenceIds) {
          assert.ok(itemIds.has(sid), `Q${q.id} sequenceId ${sid} not in items`);
        }
        break;
      }
      case 'tap-count': {
        assert.ok(q.targetId && itemIds.has(q.targetId), `Q${q.id} tap-count missing targetId`);
        assert.ok((q.requiredCount ?? 0) >= 2, `Q${q.id} tap-count needs requiredCount >= 2`);
        break;
      }
      case 'rub':
      case 'hold': {
        assert.ok(q.targetId && itemIds.has(q.targetId), `Q${q.id} ${q.mechanic} missing targetId`);
        break;
      }
      case 'wait': {
        assert.ok((q.waitSeconds ?? 0) >= 2, `Q${q.id} wait needs waitSeconds >= 2`);
        break;
      }
      case 'shake': {
        assert.ok((q.requiredCount ?? 0) >= 2, `Q${q.id} shake needs requiredCount >= 2`);
        break;
      }
      case 'keypad': {
        assert.ok(
          q.acceptedAnswers && q.acceptedAnswers.length > 0,
          `Q${q.id} keypad missing acceptedAnswers`
        );
        break;
      }
      case 'word-tap': {
        assert.ok(
          q.targetWord && q.prompt.includes(q.targetWord),
          `Q${q.id} word-tap targetWord "${q.targetWord}" not found in prompt "${q.prompt}"`
        );
        break;
      }
    }
  }
});

test('progression rules: solve, hint, skip, unlock, sanitize', () => {
  let state = createInitialProgress();
  assert.equal(state.currentLevel, 1);
  assert.equal(state.highestUnlocked, 1);
  assert.equal(isLevelUnlocked(state, 1), true);
  assert.equal(isLevelUnlocked(state, 2), false);

  state = solveLevel(state, 1);
  assert.deepEqual(state.solvedLevels, [1]);
  assert.equal(state.highestUnlocked, 2);
  assert.equal(state.hints, 11);
  assert.equal(state.currentStreak, 1);
  assert.equal(isLevelUnlocked(state, 2), true);

  const hintRes = spendHint(state);
  assert.equal(hintRes.ok, true);
  assert.equal(hintRes.next.hints, 10);
  assert.equal(hintRes.next.hintsUsed, 1);

  const skipRes = skipLevelProgress(hintRes.next, 2);
  assert.equal(skipRes.ok, true);
  assert.equal(skipRes.next.currentLevel, 3);
  assert.equal(skipRes.next.highestUnlocked, 3);
  assert.equal(skipRes.next.currentStreak, 0);

  const sanitized = sanitizeProgress({
    currentLevel: 999,
    highestUnlocked: 5,
    solvedLevels: [1, 2, 2, -4, 300],
    hints: -2,
  });
  assert.deepEqual(sanitized.solvedLevels, [1, 2]);
  assert.equal(sanitized.highestUnlocked, 5);
  assert.equal(sanitized.currentLevel, 5);
  assert.equal(TOTAL_LEVELS, 250);
});

test('puzzle evaluation helpers work accurately', () => {
  const q13 = QUESTIONS[12];
  assert.equal(evaluateKeypadAnswer(q13, ' 87 '), true);
  assert.equal(evaluateKeypadAnswer(q13, '86'), false);

  const seq = ['a', 'b', 'c'];
  const s1 = evaluateSequenceTap(seq, [], 'a');
  assert.equal(s1.status, 'progress');
  const s2 = evaluateSequenceTap(seq, s1.nextProgress, 'c');
  assert.equal(s2.status, 'wrong');
  const s3 = evaluateSequenceTap(seq, ['a', 'b'], 'c');
  assert.equal(s3.status, 'complete');

  assert.equal(checkDistanceOverlap({ x: 50, y: 50 }, { x: 55, y: 55 }), true);
  assert.equal(checkDistanceOverlap({ x: 20, y: 20 }, { x: 80, y: 80 }), false);
  assert.equal(isDraggedAway({ x: 5, y: 50 }), true);
  assert.equal(isDraggedAway({ x: 50, y: 50 }), false);
});
