import { describe, expect, it } from 'vitest';

import { buildAurumResponseContract } from '../aurum-response-contract';
import { buildStrictReplyLanguageInstruction, resolveReplyLanguage } from '../language';

describe('Aurum response contract', () => {
  it('keeps reflection mode grounded and modest', () => {
    const contract = buildAurumResponseContract('reflection');

    expect(contract).toContain('Stay close to the user text');
    expect(contract).toContain('Favor one central tension');
    expect(contract).toContain('Do not jump to childhood, trauma, identity collapse');
    expect(contract).toContain('Write 4 to 6 sentences.');
    expect(contract).toContain('End with one gentle opening');
  });

  it('makes conversation mode answer the latest message first', () => {
    const contract = buildAurumResponseContract('conversation');

    expect(contract).toContain('Respond to the latest user message first');
    expect(contract).toContain('Advance only one thread');
  });
});

describe('Reply language rules', () => {
  it('prefers the latest human message over the app locale', () => {
    expect(resolveReplyLanguage('Sono mentalmente stanco', 'en')).toBe('it');
    expect(resolveReplyLanguage('Estoy agotado', 'en')).toBe('es');
  });

  it('tells the model to sound natural in the target language', () => {
    const instruction = buildStrictReplyLanguageInstruction('it', 'en');

    expect(instruction).toContain('entirely in Italian');
    expect(instruction).toContain('Prefer idiomatic, natural phrasing');
    expect(instruction).toContain('literal translation');
  });
});
