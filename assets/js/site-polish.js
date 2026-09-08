(function () {
    'use strict';

    const skippedTags = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);
    const emojiPattern = /\p{Extended_Pictographic}/gu;
    const decorativeArrowPattern = /[←↑→↓↖↗↘↙↻]/g;

    function loadResponsiveStyles() {
        if (!document.querySelector('link[data-site-polish]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'assets/css/mobile-polish.css';
            link.dataset.sitePolish = 'true';
            document.head.appendChild(link);
        }

        if (!document.querySelector('link[data-site-polish-fixes]')) {
            const fixes = document.createElement('link');
            fixes.rel = 'stylesheet';
            fixes.href = 'assets/css/mobile-polish-fixes.css';
            fixes.dataset.sitePolishFixes = 'true';
            document.head.appendChild(fixes);
        }
    }

    function cleanText(value) {
        return value
            .replace(emojiPattern, '')
            .replace(decorativeArrowPattern, '')
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

    function stripEmojiAndDecorativeArrows() {
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

    function createSignalExample() {
        const background = document.getElementById('background');
        if (!background || document.getElementById('signal-example')) return null;

        const figure = document.createElement('figure');
        figure.id = 'signal-example';
        figure.className = 'dev-article-figure polish-example';
        figure.setAttribute('aria-labelledby', 'signal-example-title');
        figure.innerHTML = `
            <div class="figure-heading">
                <h3 id="signal-example-title">One prompt, two observability surfaces</h3>
                <span>conceptual animation</span>
            </div>
            <p>The experiment compares two different views of the same run: a probe reading the recurrent state, and a monitor reading the model's written rationale.</p>
            <div class="polish-example-stage" role="img" aria-label="Conceptual animation showing an internal-state signal becoming stronger across recurrent passes while a rationale signal remains weaker and less stable.">
                <div class="signal-row">
                    <div class="signal-label"><strong>Internal state</strong><span>feature becomes easier for a linear probe to recover</span></div>
                    <div class="signal-track">
                        <span class="signal-step"></span><span class="signal-step"></span><span class="signal-step"></span><span class="signal-step"></span>
                    </div>
                </div>
                <div class="signal-row">
                    <div class="signal-label"><strong>Written rationale</strong><span>the same label may remain difficult to recover from text</span></div>
                    <div class="signal-track rationale">
                        <span class="signal-step"></span><span class="signal-step"></span><span class="signal-step"></span><span class="signal-step"></span>
                    </div>
                </div>
                <div class="signal-row signal-loop-row" aria-hidden="true">
                    <span></span>
                    <div class="signal-loop-labels"><span>early</span><span>mid</span><span>late</span><span>final</span></div>
                </div>
            </div>
            <figcaption>Conceptual illustration of the measurement setup, not a visualization of Huginn's activation vectors or a replacement for the measured charts below.</figcaption>
        `;

        background.appendChild(figure);
        return figure;
    }

    function createCausalExample() {
        const trajectory = document.getElementById('trajectory');
        if (!trajectory || document.getElementById('causal-example')) return null;

        const figure = document.createElement('figure');
        figure.id = 'causal-example';
        figure.className = 'dev-article-figure polish-example';
        figure.setAttribute('aria-labelledby', 'causal-example-title');
        figure.innerHTML = `
            <div class="figure-heading">
                <h3 id="causal-example-title">Decodable is not the same as causal</h3>
                <span>conceptual animation</span>
            </div>
            <p>A probe can successfully read a feature without showing that the base model uses that feature. Patching asks the stronger question: does changing the state change behavior?</p>
            <div class="polish-example-stage causal-stage">
                <div class="causal-lane probe">
                    <div class="causal-label"><strong>Probe</strong><span>read from state</span></div>
                    <div class="causal-wire"><span class="causal-pulse"></span></div>
                    <div class="causal-output">label is decodable</div>
                </div>
                <div class="causal-lane patch">
                    <div class="causal-label"><strong>Patch</strong><span>intervene on state</span></div>
                    <div class="causal-wire"><span class="causal-pulse"></span></div>
                    <div class="causal-output">answer may stay unchanged</div>
                </div>
            </div>
            <figcaption>This is why I report late linear decodability without demonstrated behavioral use: the probe result is strong, while the causal test is still inconclusive.</figcaption>
        `;

        trajectory.appendChild(figure);
        return figure;
    }

    function animateExamples(figures) {
        if (!figures.length) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotion.matches || !('IntersectionObserver' in window)) {
            figures.forEach((figure) => figure.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });

        figures.forEach((figure) => observer.observe(figure));
    }

    function initHuginnEnhancements() {
        if (!document.body.classList.contains('huginn-page')) return;
        const figures = [createSignalExample(), createCausalExample()].filter(Boolean);
        animateExamples(figures);
    }

    function init() {
        loadResponsiveStyles();
        stripEmojiAndDecorativeArrows();
        initHuginnEnhancements();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
