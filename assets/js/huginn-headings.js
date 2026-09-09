(function () {
    'use strict';

    function setText(selector, text) {
        const element = document.querySelector(selector);
        if (element && element.textContent !== text) element.textContent = text;
    }

    function setSectionHeadings() {
        const backgroundHeadings = document.querySelectorAll('#background > h2');
        const background = [
            'What I actually wanted to know',
            'A good probe can still fool you',
            'Huginn gives me a clean compute dial',
        ];
        backgroundHeadings.forEach((heading, index) => {
            if (background[index] && heading.textContent !== background[index]) heading.textContent = background[index];
        });

        setText('#frontier-context > h2', 'Why this question matters more now');
        setText('#why-huginn > h2', 'Why Huginn was the right testbed');
        setText('#method > h2', 'I needed ground truth inside the task');
        setText('#trajectory > h2', 'The interesting part is when the signal appears');
        setText('#monitors > h2', 'Then the simple story falls apart');
        setText('#patching > h2', 'So I tried to make the signal matter');
        setText('#limits > h2', 'The null result changed what I think this means');
        setText('#resources > h2', 'Everything behind the result');

        const contents = new Map([
            ['#background', 'What I wanted to know'],
            ['#frontier-context', 'Why this matters now'],
            ['#method', 'How I tested it'],
            ['#trajectory', 'Where the signal appears'],
            ['#patching', 'Does the signal matter?'],
            ['#limits', 'What I still do not know'],
            ['#resources', 'Audit the work'],
        ]);
        document.querySelectorAll('.article-contents a[href]').forEach((link) => {
            const replacement = contents.get(link.getAttribute('href'));
            if (replacement && link.textContent !== replacement) link.textContent = replacement;
        });
    }

    function setStaticFigureHeadings() {
        setText('#walkthrough-title', 'What changes on each recurrent pass');
        setText('#openai-monitorability-title', 'Longer reasoning gives monitors more to inspect');
        setText('#openai-control-title', 'Astra can steer its written reasoning much more');
        setText('#method .figure-heading h3', 'A tiny version of the task');
        setText('#trajectory .figure-heading h3', 'When the hidden state starts giving the label away');
        setText('#monitors > figure .figure-heading h3', 'The state is readable even when the answer is not');
        setText('#patching > figure .figure-heading h3', 'What happens when I swap the state');

        const methodSummary = document.querySelector('#method details summary');
        if (methodSummary && methodSummary.textContent !== 'Why I kept the data split strict') {
            methodSummary.textContent = 'Why I kept the data split strict';
        }
    }

    function setDynamicFigureHeadings() {
        setText('#architecture-explorer-title', 'What changes with another recurrent pass');
        setText('#signal-example-title', 'Where the state pulls away from the written rationale');
        setText('#causal-example-title', 'Did swapping the state actually move the answer?');

        const depthHeading = document.querySelector('.architecture-depth-heading strong');
        if (depthHeading && depthHeading.textContent !== 'What I change when I turn recurrence up') {
            depthHeading.textContent = 'What I change when I turn recurrence up';
        }

        const experimentLabel = document.querySelector('.architecture-experiment-note > span');
        if (experimentLabel && experimentLabel.textContent !== 'Why I care about this control') {
            experimentLabel.textContent = 'Why I care about this control';
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