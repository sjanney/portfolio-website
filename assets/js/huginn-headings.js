(function () {
    'use strict';

    function setText(selector, text) {
        const element = document.querySelector(selector);
        if (element && element.textContent !== text) element.textContent = text;
    }

    function setSectionHeadings() {
        const backgroundHeadings = document.querySelectorAll('#background > h2');
        const background = [
            'The monitoring question',
            'Why probe accuracy is not enough',
            'Recurrence as a controlled compute intervention',
        ];
        backgroundHeadings.forEach((heading, index) => {
            if (background[index] && heading.textContent !== background[index]) heading.textContent = background[index];
        });

        setText('#frontier-context > h2', 'Why this matters for current model monitoring');
        setText('#why-huginn > h2', 'Why Huginn is a useful testbed');
        setText('#method > h2', 'Designing a task with known latent structure');
        setText('#trajectory > h2', 'When linear decodability emerges');
        setText('#monitors > h2', 'Comparing state and rationale observability');
        setText('#patching > h2', 'Testing whether the decoded signal is causally used');
        setText('#limits > h2', 'What the current result does and does not show');
        setText('#resources > h2', 'Materials and reproducibility');

        const contents = new Map([
            ['#background', 'Monitoring question'],
            ['#frontier-context', 'Current context'],
            ['#method', 'Experimental design'],
            ['#trajectory', 'Decodability'],
            ['#patching', 'Causal test'],
            ['#limits', 'Interpretation'],
            ['#resources', 'Materials'],
        ]);
        document.querySelectorAll('.article-contents a[href]').forEach((link) => {
            const replacement = contents.get(link.getAttribute('href'));
            if (replacement && link.textContent !== replacement) link.textContent = replacement;
        });
    }

    function setStaticFigureHeadings() {
        setText('#walkthrough-title', 'Recurrent computation through one token position');
        setText('#openai-monitorability-title', 'Monitorability as reasoning length changes');
        setText('#openai-control-title', 'Chain of thought controllability at matched lengths');
        setText('#method .figure-heading h3', 'A simplified version of the policy task');
        setText('#trajectory .figure-heading h3', 'Path label decodability across recurrence');
        setText('#monitors > figure .figure-heading h3', 'State, rationale, and task accuracy at the same depth');
        setText('#patching > figure .figure-heading h3', 'Counterfactual state patching by loop');

        const methodSummary = document.querySelector('#method details summary');
        if (methodSummary && methodSummary.textContent !== 'Why the data split matters') {
            methodSummary.textContent = 'Why the data split matters';
        }
    }

    function setDynamicFigureHeadings() {
        setText('#architecture-explorer-title', 'How recurrent computation changes with depth');
        setText('#signal-example-title', 'Where state and rationale observability diverge');
        setText('#causal-example-title', 'What changes under counterfactual state patching');

        const depthHeading = document.querySelector('.architecture-depth-heading strong');
        if (depthHeading && depthHeading.textContent !== 'Changing recurrence depth without changing the model') {
            depthHeading.textContent = 'Changing recurrence depth without changing the model';
        }

        const experimentLabel = document.querySelector('.architecture-experiment-note > span');
        if (experimentLabel && experimentLabel.textContent !== 'Why this control matters') {
            experimentLabel.textContent = 'Why this control matters';
        }
    }

    function applyHeadings() {
        setSectionHeadings();
        setStaticFigureHeadings();
        setDynamicFigureHeadings();
    }

    function init() {
        if (!document.body.classList.contains('huginn-page')) return;
        applyHeadings();

        const observer = new MutationObserver(() => applyHeadings());
        observer.observe(document.querySelector('.dev-article') || document.body, {
            childList: true,
            subtree: true,
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();