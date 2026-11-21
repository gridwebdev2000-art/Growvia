import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MESSAGES,
  getOppositeLocale,
  getTranslatedSubpage,
  normalizeLocale,
  resolveInitialLocale,
} from './i18n';
import { SEO_ROUTE_PATHS } from './seoConfig';

test('normalizeLocale parses valid EN/FR locale tags and rejects unknown strings', () => {
  assert.equal(normalizeLocale('en'), 'en');
  assert.equal(normalizeLocale('en-CA'), 'en');
  assert.equal(normalizeLocale('FR'), 'fr');
  assert.equal(normalizeLocale('fr-CA'), 'fr');
  assert.equal(normalizeLocale('es-MX'), null);
  assert.equal(normalizeLocale(''), null);
  assert.equal(normalizeLocale(null), null);
});

test('getOppositeLocale toggles cleanly between English and French', () => {
  assert.equal(getOppositeLocale('en'), 'fr');
  assert.equal(getOppositeLocale('fr'), 'en');
});

test('resolveInitialLocale prioritizes query param over stored preference over navigator language', () => {
  assert.equal(
    resolveInitialLocale({
      search: '?lang=fr',
      stored: 'en',
      navigatorLanguage: 'en-CA',
    }),
    'fr'
  );
  assert.equal(
    resolveInitialLocale({
      search: '',
      stored: 'fr',
      navigatorLanguage: 'en-CA',
    }),
    'fr'
  );
  assert.equal(
    resolveInitialLocale({
      search: '',
      stored: null,
      navigatorLanguage: 'fr-CA',
    }),
    'fr'
  );
  assert.equal(
    resolveInitialLocale({
      search: '?lang=de',
      stored: null,
      navigatorLanguage: 'en-US',
    }),
    'en'
  );
});

test('MESSAGES maintains complete parity across EN and FR collections and subpages', () => {
  const en = MESSAGES.en;
  const fr = MESSAGES.fr;

  assert.equal(en.navbar.serviceMenuLinks.length, fr.navbar.serviceMenuLinks.length);
  assert.equal(en.hero.sectors.length, fr.hero.sectors.length);
  assert.equal(en.campaigns.tiles.length, fr.campaigns.tiles.length);
  assert.equal(en.services.items.length, fr.services.items.length);
  assert.equal(en.results.items.length, fr.results.items.length);
  assert.equal(en.reviews.rowOne.length, fr.reviews.rowOne.length);
  assert.equal(en.reviews.rowTwo.length, fr.reviews.rowTwo.length);
  assert.equal(en.websites.items.length, fr.websites.items.length);
  assert.equal(en.difference.team.length, fr.difference.team.length);
  assert.equal(en.faq.items.length, fr.faq.items.length);

  for (const path of SEO_ROUTE_PATHS) {
    if (path === '/') continue;
    const subEn = getTranslatedSubpage(path, 'en');
    const subFr = getTranslatedSubpage(path, 'fr');
    assert.ok(subFr.breadcrumbLabel.length > 0);
    assert.notEqual(subFr.content.h1Lead, subEn.content.h1Lead);
    assert.equal(subFr.content.highlights.length, subEn.content.highlights.length);
    assert.equal(subFr.content.processSteps.length, subEn.content.processSteps.length);
    assert.equal(subEn.content.editorialSection.blocks.length, 3);
    assert.equal(
      subFr.content.editorialSection.blocks.length,
      subEn.content.editorialSection.blocks.length
    );
    assert.notEqual(
      subFr.content.editorialSection.heading,
      subEn.content.editorialSection.heading
    );
    assert.equal(subEn.content.editorialSection.blocks[0].heading, 'How we work');
    assert.equal(subEn.content.editorialSection.blocks[1].heading, 'What to expect');
    assert.equal(
      subEn.content.editorialSection.blocks[2].heading,
      'Why businesses in Ontario & BC choose us'
    );
  }
});
