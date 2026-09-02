(() => {
  const STORAGE_KEY = 'asteria.locale';
  const supported = new Set(['en', 'cs']);
  const textSources = new WeakMap();
  const attrSources = new WeakMap();
  let locale = supported.has(localStorage.getItem(STORAGE_KEY)) ? localStorage.getItem(STORAGE_KEY) : 'en';
  let strings = {};
  let initialized = false;

  async function load(code) {
    const response = await fetch(`/locales/${code}.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Locale ${code} could not be loaded (${response.status})`);
    const payload = await response.json();
    strings = payload.strings || {};
    locale = code;
    document.documentElement.lang = code === 'cs' ? 'cs' : 'en';
  }

  function t(source, vars = {}) {
    if (source == null) return '';
    const raw = String(source);
    let value = strings[raw] ?? raw;
    for (const [key, replacement] of Object.entries(vars)) value = value.replaceAll(`{${key}}`, String(replacement));
    return value;
  }

  function translateTextValue(value) {
    const match = String(value).match(/^(\s*)(.*?)(\s*)$/s);
    if (!match) return t(value);
    const [, before, core, after] = match;
    return before + t(core) + after;
  }

  function apply(root = document) {
    const target = root instanceof Document ? root.documentElement : root;
    if (!target) return;

    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (!textSources.has(node)) textSources.set(node, node.nodeValue);
      node.nodeValue = translateTextValue(textSources.get(node));
    }

    const elements = target.querySelectorAll ? [target, ...target.querySelectorAll('*')] : [];
    for (const element of elements) {
      if (!(element instanceof Element)) continue;
      let sources = attrSources.get(element);
      if (!sources) {
        sources = {};
        attrSources.set(element, sources);
      }
      for (const attr of ['aria-label', 'placeholder', 'title']) {
        if (!element.hasAttribute(attr)) continue;
        if (!(attr in sources)) sources[attr] = element.getAttribute(attr);
        element.setAttribute(attr, t(sources[attr]));
      }
    }
    updateControls();
  }

  function updateControls() {
    document.querySelectorAll('[data-locale]').forEach(button => {
      const active = button.dataset.locale === locale;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  async function setLocale(code) {
    if (!supported.has(code) || code === locale) {
      updateControls();
      return;
    }
    await load(code);
    localStorage.setItem(STORAGE_KEY, code);
    window.dispatchEvent(new CustomEvent('asteria:localechange', { detail: { locale: code } }));
    apply(document);
  }

  function bindControls() {
    document.addEventListener('click', event => {
      const button = event.target.closest?.('[data-locale]');
      if (!button) return;
      setLocale(button.dataset.locale).catch(console.error);
    });
  }

  async function init() {
    if (!initialized) {
      bindControls();
      initialized = true;
    }
    await load(locale);
    apply(document);
    return api;
  }

  const api = { init, apply, setLocale, t, get locale() { return locale; } };
  window.AsteriaI18n = api;
})();
