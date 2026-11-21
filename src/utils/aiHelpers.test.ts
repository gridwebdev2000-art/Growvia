import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateGrowthPlanInput,
  validateAuditInput,
  parseGrowthPlanJson,
  extractGroundingSources,
  sanitizeChatHistory,
  formatAudioDataUrl,
  isHttpUrl,
} from './aiHelpers';

test('validateGrowthPlanInput checks required business fields', () => {
  assert.equal(validateGrowthPlanInput({ businessName: 'A', industry: 'HVAC', city: 'Oakville', goal: 'More calls' }).valid, false);
  assert.equal(validateGrowthPlanInput({ businessName: 'Ridge HVAC', industry: 'HVAC', city: 'Oakville', goal: 'Book 20 furnace tune-ups' }).valid, true);
});

test('validateAuditInput validates URLs and search topics', () => {
  assert.equal(isHttpUrl('https://growvia.ca'), true);
  assert.equal(isHttpUrl('ftp://growvia.ca'), false);
  assert.equal(validateAuditInput({ websiteUrl: '', marketQuery: '' }).valid, false);
  assert.equal(validateAuditInput({ websiteUrl: 'not-a-url', marketQuery: '' }).valid, false);
  assert.equal(validateAuditInput({ websiteUrl: 'https://example.ca', marketQuery: '' }).valid, true);
  assert.equal(validateAuditInput({ websiteUrl: '', marketQuery: 'Dentist in Ottawa' }).valid, true);
});

test('parseGrowthPlanJson parses fenced JSON and normalizes services', () => {
  const sample = `\`\`\`json
  {
    "summary": "Focused Ontario growth sprint.",
    "recommendedServices": ["Google Ads", "Website", "InvalidService"],
    "metaAd": { "hook": "Stop waiting", "primaryText": "Local crew.", "cta": "Book now" },
    "googleAd": { "headline1": "Oakville HVAC", "headline2": "Same Day Service", "description": "Call today.", "keywords": ["hvac oakville"] },
    "videoScript": { "title": "Van Tour", "durationLabel": "00:30", "spokenScript": "Hi Oakville!", "shotIdeas": ["Truck arrival"] },
    "websiteTips": { "heroHeadline": "Stay Warm in Oakville", "conversionChecklist": ["Add phone header"] },
    "localSeo": {
      "nearbyCities": ["Oakville", "Burlington", "Mississauga"],
      "searchPhrases": ["furnace repair oakville", "hvac tune up halton"],
      "mapPackTip": "Add Halton neighbourhood service pages and local Google Business photos."
    }
  }
  \`\`\``;
  const parsed = parseGrowthPlanJson(sample);
  assert.equal(parsed.summary, 'Focused Ontario growth sprint.');
  assert.deepEqual(parsed.recommendedServices, ['Google Ads', 'Website']);
  assert.equal(parsed.videoScript.spokenScript, 'Hi Oakville!');
  assert.deepEqual(parsed.localSeo.nearbyCities, ['Oakville', 'Burlington', 'Mississauga']);
  assert.equal(parsed.localSeo.searchPhrases.length, 2);
});

test('extractGroundingSources deduplicates valid web URLs', () => {
  const chunks = [
    { web: { uri: 'https://example.ca/a', title: 'Source A' } },
    { web: { uri: 'https://example.ca/a', title: 'Duplicate A' } },
    { web: { uri: 'javascript:alert(1)', title: 'Bad' } },
    { web: { uri: 'https://example.ca/b', title: '' } },
  ];
  const sources = extractGroundingSources(chunks);
  assert.deepEqual(sources, [
    { title: 'Source A', url: 'https://example.ca/a' },
    { title: 'https://example.ca/b', url: 'https://example.ca/b' },
  ]);
});

test('sanitizeChatHistory bounds turns and builds audio URL', () => {
  const cleaned = sanitizeChatHistory([
    { role: 'user', text: ' Hi ' },
    { role: 'system', text: 'ignored' },
    { role: 'model', text: '' },
    { role: 'model', text: 'Hello!' },
  ]);
  assert.deepEqual(cleaned, [
    { role: 'user', text: 'Hi' },
    { role: 'model', text: 'Hello!' },
  ]);
  assert.equal(formatAudioDataUrl('ABC='), 'data:audio/wav;base64,ABC=');
});
