(function () {
    'use strict';

    const skippedTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);
    const emojiPattern = /\p{Extended_Pictographic}/gu;
    const decorativeArrowPattern = /[←↑→↓↖↗↘↙↻]/g;
    const visibleDashPattern = /[-‐‑‒–—―]/g;

    function appendStylesheet(href, dataAttribute) {
        if (document.querySelector(`link[${dataAttribute}]`)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute(dataAttribute, 'true');
        document.head.appendChild(link);
    }

    function appendScript(src, dataAttribute) {
        if (document.querySelector(`script[${dataAttribute}]`)) return;
        const script = document.createElement('script');
        script.src = src;
        script.setAttribute(dataAttribute, 'true');
        document.body.appendChild(script);
    }

    function loadResponsiveStyles() {
        appendStylesheet('assets/css/mobile-polish.css', 'data-site-polish');
        appendStylesheet('assets/css/mobile-polish-fixes.css', 'data-site-polish-fixes');
    }

    function loadHuginnResearch() {
        if (!document.body.classList.contains('huginn-page')) return;
        appendStylesheet('assets/css/huginn-architecture.css', 'data-huginn-architecture-style');
        appendStylesheet('assets/css/huginn-evidence.css', 'data-huginn-evidence-style');
        appendScript('assets/js/huginn-architecture.js', 'data-huginn-architecture');
        appendScript('assets/js/huginn-evidence.js', 'data-huginn-evidence');
    }

    function cleanText(value) {
        return value
            .replace(emojiPattern, '')
            .replace(decorativeArrowPattern, '')
            .replace(/(^|[\s([{:;,=])-(?=\d(?:\.\d)?)/g, '$1−')
            .replace(/([a-z])-(?=\d)/g, '$1−')
            .replace(visibleDashPattern, ' ')
            .replace(/ {2,}/g, ' ');
    }

    function sanitizeTextNode(node) {
        const parent = node.parentElement;
        if (!parent || skippedTags.has(parent.tagName)) return;
        const cleaned = cleanText(node.nodeValue || '');
        if (cleaned !== node.nodeValue) node.nodeValue = cleaned;
    }

    function sanitizeTree(root) {
        if (root.nodeType === Node.TEXT_NODE) {
            sanitizeTextNode(root);
            return;
        }
        if (!(root instanceof Element) || skippedTags.has(root.tagName)) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) sanitizeTextNode(walker.currentNode);
    }

    function stripDecorativeGlyphsAndDashes() {
        document.title = cleanText(document.title);
        sanitizeTree(document.body);
        const cycle = document.querySelector('.model-cycle');
        if (cycle) cycle.textContent = 'loop';
        const outputSymbol = document.querySelector('.model-block[data-model-stage="output"] .model-symbol');
        if (outputSymbol) outputSymbol.textContent = 'out';

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData') {
                    sanitizeTextNode(mutation.target);
                    return;
                }
                mutation.addedNodes.forEach((node) => sanitizeTree(node));
            });
        });
        observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    }

    function init() {
        loadResponsiveStyles();
        stripDecorativeGlyphsAndDashes();
        loadHuginnResearch();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();