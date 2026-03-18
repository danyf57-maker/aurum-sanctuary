import { describe, expect, it } from 'vitest';

import { buildAurumResponseContract } from '../aurum-response-contract';
import {
  buildStrictReplyLanguageInstruction,
  resolvePromptLanguage,
  resolveReplyLanguage,
} from '../language';
import { buildAurumSystemPrompt } from '../aurum-system-prompts';
import { PRODUCT_LOCALES, REFLECTION_LANGUAGES } from '../../language-policy';

describe('Aurum response contract', () => {
  it('keeps reflection mode grounded and modest', () => {
    const contract = buildAurumResponseContract('reflection');

    expect(contract).toContain('Stay close to the user text');
    expect(contract).toContain('Concrete beats elegant');
    expect(contract).toContain('Favor one central tension');
    expect(contract).toContain('Name a pattern only when the sequence is clearly visible');
    expect(contract).toContain('Use caution only for the step beyond the text');
    expect(contract).toContain('Do not jump to trauma, childhood, identity collapse');
    expect(contract).toContain('Write 4 to 6 sentences.');
    expect(contract).toContain('If a loop is obvious, state the steps plainly');
    expect(contract).toContain('End with one precise opening');
  });

  it('makes conversation mode answer the latest message first', () => {
    const contract = buildAurumResponseContract('conversation');

    expect(contract).toContain('Answer the latest user message first');
    expect(contract).toContain('Advance only one thread');
    expect(contract).toContain('Use one question at most');
  });

  it('can build a native French contract', () => {
    const contract = buildAurumResponseContract('reflection', 'fr');

    expect(contract).toContain('Contrat de réponse Aurum');
    expect(contract).toContain('Reste au plus près du texte');
    expect(contract).toContain('Écris 4 à 6 phrases');
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

  it('resolves a concrete prompt language when the reply language is ambiguous', () => {
    expect(resolvePromptLanguage('same-as-user', 'fr')).toBe('fr');
    expect(resolvePromptLanguage('same-as-user', 'en')).toBe('en');
    expect(resolvePromptLanguage('it', 'en')).toBe('it');
  });

  it('tells the model to sound natural in the target language', () => {
    const instruction = buildStrictReplyLanguageInstruction('it', 'en');

    expect(instruction).toContain('interamente in italiano');
    expect(instruction).toContain('formulazione idiomatica');
    expect(instruction).toContain('traduzione letterale');
  });

  it('can issue a strict Portuguese language rule', () => {
    const instruction = buildStrictReplyLanguageInstruction('pt', 'en');

    expect(instruction).toContain('inteiramente em português');
    expect(instruction).toContain('tem prioridade');
  });

  it('builds a native Portuguese system prompt', () => {
    const prompt = buildAurumSystemPrompt('reflection', 'pt');

    expect(prompt).toContain('Tu es Aurum em modo reflexão');
    expect(prompt).toContain('Prioridades');
  });
});
