import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_QUOTE_DATA,
  validateQuoteStep,
  toggleServiceSelection,
  getNextStep,
  getPrevStep,
  formatStepCounter,
  getProgressPercent,
  isValidEmail,
  isValidPhone,
  buildQuoteMailtoHref,
  hasQuoteProgress,
  serializeQuoteDraft,
  parseQuoteDraft,
  mergeQuoteDraftWithPrefill,
} from './quoteLogic';

test('email and phone validators accept valid Ontario inputs and reject invalid ones', () => {
  assert.equal(isValidEmail('owner@ontariobiz.ca'), true);
  assert.equal(isValidEmail('bad-email'), false);
  assert.equal(isValidPhone('(416) 555-0192'), true);
  assert.equal(isValidPhone('416555'), false);
});

test('step 1 validation requires at least one service', () => {
  const invalid = validateQuoteStep(1, INITIAL_QUOTE_DATA);
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.services);

  const valid = validateQuoteStep(1, {
    ...INITIAL_QUOTE_DATA,
    services: ['Google Ads'],
  });
  assert.equal(valid.valid, true);

  const invalidFr = validateQuoteStep(1, INITIAL_QUOTE_DATA, 'fr');
  assert.equal(invalidFr.valid, false);
  assert.ok(invalidFr.errors.services.includes('service'));
  assert.notEqual(invalidFr.errors.services, invalid.errors.services);
});

test('step 2 validation checks business name and industry', () => {
  const invalid = validateQuoteStep(2, {
    ...INITIAL_QUOTE_DATA,
    businessName: 'A',
    industry: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.businessName);
  assert.ok(invalid.errors.industry);

  const valid = validateQuoteStep(2, {
    ...INITIAL_QUOTE_DATA,
    businessName: 'Maple Leaf Plumbing',
    industry: 'Home Services',
  });
  assert.equal(valid.valid, true);
});

test('step 3 validation requires contact name, email, and 10+ digit phone', () => {
  const invalid = validateQuoteStep(3, {
    ...INITIAL_QUOTE_DATA,
    contactName: 'Jo',
    email: 'invalid',
    phone: '123',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.phone);

  const valid = validateQuoteStep(3, {
    ...INITIAL_QUOTE_DATA,
    contactName: 'Jordan Lee',
    email: 'jordan@mapleleaf.ca',
    phone: '905-555-0148',
  });
  assert.equal(valid.valid, true);
});

test('step 4 validation requires selecting a monthly ad budget', () => {
  assert.equal(validateQuoteStep(4, INITIAL_QUOTE_DATA).valid, false);
  assert.equal(
    validateQuoteStep(4, { ...INITIAL_QUOTE_DATA, monthlyBudget: '$1,000 to $3,000' }).valid,
    true
  );
});

test('toggleServiceSelection adds and removes items cleanly', () => {
  const added = toggleServiceSelection([], 'Website');
  assert.deepEqual(added, ['Website']);
  const addedSecond = toggleServiceSelection(added, 'Google Ads');
  assert.deepEqual(addedSecond, ['Website', 'Google Ads']);
  const removed = toggleServiceSelection(addedSecond, 'Website');
  assert.deepEqual(removed, ['Google Ads']);
});

test('step navigation, counter formatting, and mailto link builder work properly', () => {
  assert.equal(getNextStep(1), 2);
  assert.equal(getNextStep(5), 5);
  assert.equal(getPrevStep(1), 1);
  assert.equal(getPrevStep(3), 2);
  assert.equal(formatStepCounter(1), '01 / 05');
  assert.equal(formatStepCounter(5), '05 / 05');
  assert.equal(getProgressPercent(3), 60);

  const mailto = buildQuoteMailtoHref({
    services: ['Website', 'Google Ads'],
    businessName: 'Oakville Dental',
    industry: 'Healthcare',
    contactName: 'Sam Patel',
    email: 'sam@oakvilledental.ca',
    phone: '905-555-0199',
    monthlyBudget: '$3,000 to $5,000',
    notes: 'Launch in spring',
  });
  assert.ok(mailto.startsWith('mailto:growviacanada@gmail.com?subject='));
  assert.ok(mailto.includes('Oakville%20Dental'));
  assert.ok(mailto.includes('Launch%20in%20spring'));
});

test('quote draft serialization, parsing, and prefill merge preserve entered details', () => {
  assert.equal(hasQuoteProgress(INITIAL_QUOTE_DATA, 1), false);

  const draftData = {
    ...INITIAL_QUOTE_DATA,
    services: ['Google Ads'] as ('Google Ads')[],
    businessName: 'Halton Heating',
    industry: 'HVAC',
    contactName: 'Taylor',
  };
  assert.equal(hasQuoteProgress(draftData, 2), true);

  const raw = serializeQuoteDraft(2, draftData);
  const parsed = parseQuoteDraft(raw);
  assert.ok(parsed);
  assert.equal(parsed.step, 2);
  assert.equal(parsed.data.businessName, 'Halton Heating');
  assert.deepEqual(parsed.data.services, ['Google Ads']);

  assert.equal(parseQuoteDraft('invalid json'), null);

  // Generic open restores saved step + fields
  const genericMerge = mergeQuoteDraftWithPrefill(parsed, {});
  assert.equal(genericMerge.step, 2);
  assert.equal(genericMerge.data.businessName, 'Halton Heating');

  // Contextual prefill merges requested services while preserving prior contact/business input
  const prefillMerge = mergeQuoteDraftWithPrefill(parsed, {
    services: ['Website'],
    notes: 'Need landing page speed audit',
  });
  assert.equal(prefillMerge.step, 1);
  assert.deepEqual(prefillMerge.data.services, ['Google Ads', 'Website']);
  assert.equal(prefillMerge.data.businessName, 'Halton Heating');
  assert.equal(prefillMerge.data.contactName, 'Taylor');
  assert.equal(prefillMerge.data.notes, 'Need landing page speed audit');
});
