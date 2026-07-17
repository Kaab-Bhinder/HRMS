import { useEffect } from 'react';
import { useI18n } from '../store/i18n';
import { ID } from './id';

/**
 * Fallback DOM translator. The clean path is `t()` inside shared components
 * (nav, tables, modals, headers, statuses) — that covers the bulk without any
 * flicker. This catches the remaining static page prose that isn't wrapped:
 * it walks text nodes and swaps any whose exact text is a dictionary key.
 *
 * Only exact dictionary matches are touched, so employee names, numbers and
 * emails are never altered. Originals are remembered per node so switching back
 * to English restores them. Inputs, scripts and [data-no-i18n] are skipped.
 */
const originals = new WeakMap<Node, string>();
const SKIP = new Set(['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'CODE', 'PRE']);

function shouldSkip(el: Element | null): boolean {
  while (el) {
    if (SKIP.has(el.tagName)) return true;
    if (el.hasAttribute('data-no-i18n')) return true;
    if ((el as HTMLElement).isContentEditable) return true;
    el = el.parentElement;
  }
  return false;
}

function translateNode(node: Text, lang: 'en' | 'id') {
  const raw = node.nodeValue ?? '';
  const key = raw.trim();
  if (!key || !/[A-Za-z]/.test(key)) return;
  if (shouldSkip(node.parentElement)) return;

  if (lang === 'id') {
    const en = originals.get(node) ?? key;
    const translated = ID[en];
    if (translated && translated !== key) {
      if (!originals.has(node)) originals.set(node, en);
      const next = raw.replace(key, translated);
      if (node.nodeValue !== next) node.nodeValue = next;
    }
  } else {
    const en = originals.get(node);
    if (en && node.nodeValue?.trim() !== en) {
      node.nodeValue = raw.replace(key, en);
    }
  }
}

function walk(root: Node, lang: 'en' | 'id') {
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n = tw.nextNode();
  while (n) { nodes.push(n as Text); n = tw.nextNode(); }
  for (const node of nodes) translateNode(node, lang);
}

export function AutoTranslate() {
  const { lang } = useI18n();

  useEffect(() => {
    let raf = 0;
    const run = () => walk(document.body, lang);
    run();

    // Re-apply on DOM changes (route changes, modals, async data).
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(run);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  }, [lang]);

  return null;
}
