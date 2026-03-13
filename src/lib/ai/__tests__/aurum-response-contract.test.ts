import { describe, expect, it } from 'vitest';

import { buildAurumResponseContract } from '../aurum-response-contract';
import { buildStrictReplyLanguageInstruction, resolveReplyLanguage } from '../language';
import { PRODUCT_LOCALES, REFLECTION_LANGUAGES } from '../../language-policy';

describe('Aurum response contract', () => {
  it('keeps reflection mode grounded and modest', () => {
    const contract = buildAurumResponseContract('reflection');

    expect(contract).toContain('Stay close to the user text');
    expect(contract).toContain('Concrete beats elegant');
    expect(contract).toContain('Favor one central tension');
    expect(contract).toContain('If the text clearly shows a loop');
    expect(contract).toContain('Use caution only for the step beyond the text');
    expect(contract).toContain('Do not jump to childhood, trauma, identity collapse');
    expect(contract).toContain('Write 4 to 6 sentences.');
    expect(contract).toContain('If a clear cycle is visible, state it plainly');
    expect(contract).toContain('End with one precise opening');
  });

  it('makes conversation mode answer the latest message first', () => {
    const contract = buildAurumResponseContract('conversation');

    expect(contract).toContain('Respond to the latest user message first');
    expect(contract).toContain('Advance only one thread');
    expect(contract).toContain('If the user describes an obvious repeated loop');
  });
});

describe('Reply language rules', () => {
  it('keeps a single source of truth for product and reflection languages', () => {
    expect(PRODUCT_LOCALES).toEqual(['en', 'fr']);
    expect(REFLECTION_LANGUAGES).toEqual(['en', 'fr', 'es', 'it', 'de', 'pt']);
  });

  it('prefers the latest human message over the app locale', () => {
    expect(resolveReplyLanguage('Sono mentalmente stanco', 'en')).toBe('it');
    expect(resolveReplyLanguage('Estoy agotado', 'en')).toBe('es');
  });

  it('detects Portuguese instead of drifting to Spanish', () => {
    const portugueseSample = `Ultimamente tenho sentido um cansaço que não melhora nem quando durmo. Durante o dia eu continuo funcionando, mas por dentro é como se eu estivesse ficando mais distante de mim mesmo. À noite eu sinto mais claramente o vazio.`;

    expect(resolveReplyLanguage(portugueseSample, 'en')).toBe('pt');
  });

  it('tells the model to sound natural in the target language', () => {
    const instruction = buildStrictReplyLanguageInstruction('it', 'en');

    expect(instruction).toContain('entirely in Italian');
    expect(instruction).toContain('Prefer idiomatic, natural phrasing');
    expect(instruction).toContain('literal translation');
  });

  it('can issue a strict Portuguese language rule', () => {
    const instruction = buildStrictReplyLanguageInstruction('pt', 'en');

    expect(instruction).toContain('entirely in Portuguese');
    expect(instruction).toContain('User message language takes priority over app locale');
  });
});
