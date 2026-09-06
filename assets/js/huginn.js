/* Figures replay the paper's CSV artifacts. No model inference or analytics. */
(() => {
    'use strict';
    const byId = id => document.getElementById(id);
    const percent = value => `${(Number(value) * 100).toFixed(1)}%`;
    const interval = (low, high) => `${(Number(low) * 100).toFixed(1)}–${(Number(high) * 100).toFixed(1)}%`;
    const number = value => Number(value).toFixed(4);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const activeMotion = new Map();

    // Short, interruptible cues only. Values update immediately, without tweening data.
    function animate(element, keyframes, options = {}) {
        activeMotion.get(element)?.cancel();
        if (reducedMotion.matches || !element.animate) return;
        const animation = element.animate(keyframes, {
            duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)', ...options,
        });
        activeMotion.set(element, animation);
        const clear = () => { if (activeMotion.get(element) === animation) activeMotion.delete(element); };
        animation.onfinish = clear;
        animation.oncancel = clear;
    }
    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) {
            activeMotion.forEach(animation => animation.cancel());
            activeMotion.clear();
        }
    });
    function traceFlow(selector) {
        document.querySelectorAll(selector).forEach((element, index) => {
            animate(element, [
                { opacity: .4, transform: 'translateX(-5px)' },
                { opacity: 1, transform: 'translateX(0)' },
            ], { delay: index * 65, duration: 400 });
        });
    }
    function refreshReadout(element) {
        animate(element, [
            { opacity: .55, transform: 'translateY(3px)' },
            { opacity: 1, transform: 'translateY(0)' },
        ]);
    }

    function updatePolicy() {
        const badge = byId('badge').checked;
        const exception = byId('exception').checked;
        byId('policy-path').textContent = exception ? 'Exception' : 'Base rule';
        byId('policy-answer').textContent = badge !== exception ? 'Allow' : 'Deny';
        traceFlow('.policy-demo .chain > span');
        refreshReadout(document.querySelector('.policy-result'));
    }
    ['badge', 'exception'].forEach(id => byId(id).addEventListener('change', updatePolicy));

    // A finite architecture walkthrough: no simulated predictions or activations.
    (() => {
        const figure = document.querySelector('.model-walkthrough');
        const play = byId('model-play');
        const next = byId('model-next');
        const steps = [
            ['prompt', 'Start with the prompt', 'The text is split into tokens so the model can process it numerically.'],
            ['prelude', 'Represent the prompt', 'The prelude processes the embedded tokens into a numerical representation, e. The core can refer to this on every pass.'],
            ['core', 'Initialize the state', 'A seeded random state, h₀, gives the recurrent core its starting point. It is separate from the prompt representation.'],
            ['core', 'Pass 1 of 4', 'The core combines the starting state with the prompt representation to produce an updated state, h₁.'],
            ['core', 'Pass 2 of 4', 'The updated state feeds back into the same core. The state changes; the weights do not.'],
            ['core', 'Pass 3 of 4', 'Another pass updates the state again. No new text token has been generated during these internal passes.'],
            ['core', 'Pass 4 of 4', 'The final recurrent state is ready. In the experiment, this budget could instead be 8, 16, or 32 passes.'],
            ['coda', 'Read the final state', 'The coda processes the final recurrent state before the output head maps it to scores for possible next tokens.'],
            ['output', 'Produce the next token', 'The scores define a distribution over possible tokens. Generating an explanation repeats this overall process for subsequent tokens.'],
        ];
        let index = 0, timer = null, playing = false, introduced = false;
        function stop() {
            clearTimeout(timer); timer = null; playing = false;
            play.textContent = index === steps.length - 1 ? 'Replay walkthrough' : 'Play walkthrough';
            play.setAttribute('aria-pressed', 'false');
        }
        function render() {
            const [stage, title, description] = steps[index];
            figure.dataset.step = String(index);
            figure.querySelectorAll('[data-model-stage]').forEach(block => {
                const selected = block.dataset.modelStage === stage;
                block.classList.toggle('is-current', selected);
                if (selected) block.setAttribute('aria-current', 'step');
                else block.removeAttribute('aria-current');
            });
            byId('model-stage-title').textContent = title;
            byId('model-stage-description').textContent = description;
            byId('model-progress').textContent = `${index + 1} / ${steps.length}`;
            byId('model-loop').textContent = index >= 3 && index <= 6 ? `Pass ${index - 2} of 4` : 'Update the state';
            next.textContent = index === steps.length - 1 ? 'Back to start' : 'Next step →';
            refreshReadout(document.querySelector('.model-caption'));
            const block = figure.querySelector(`[data-model-stage="${stage}"]`);
            animate(block, [{ transform: 'translateY(3px)' }, { transform: 'translateY(0)' }]);
            if (index >= 3 && index <= 6) animate(figure.querySelector('.model-cycle'), [
                { transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' },
            ], { duration: 950 });
        }
        function schedule() {
            timer = setTimeout(() => {
                if (!playing) return;
                index++; render();
                if (index === steps.length - 1) stop(); else schedule();
            }, 2200);
        }
        function start() {
            if (reducedMotion.matches) return;
            if (index === steps.length - 1) index = 0;
            playing = true; play.textContent = 'Pause'; play.setAttribute('aria-pressed', 'true');
            render(); schedule();
        }
        play.disabled = reducedMotion.matches; next.disabled = false;
        play.addEventListener('click', () => { introduced = true; if (playing) stop(); else start(); });
        next.addEventListener('click', () => { introduced = true; stop(); index = (index + 1) % steps.length; render(); });
        reducedMotion.addEventListener('change', () => { play.disabled = reducedMotion.matches; if (reducedMotion.matches) stop(); });
        document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
        render();
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) { stop(); continue; }
                    if (!introduced) { introduced = true; start(); }
                }
            }, { threshold: .35 });
            observer.observe(figure);
        }
    })();

    // Handle quoted fields so the original CSVs can be used without an export step.
    function parseCSV(text) {
        const rows = [];
        let row = [], field = '', quoted = false;
        const input = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
        for (let i = 0; i < input.length; i++) {
            const character = input[i];
            if (character === '"') {
                if (quoted && input[i + 1] === '"') { field += '"'; i++; }
                else quoted = !quoted;
            } else if (!quoted && (character === ',' || character === '\n')) {
                row.push(field); field = '';
                if (character === '\n') { if (row.some(Boolean)) rows.push(row); row = []; }
            } else field += character;
        }
        if (quoted) throw new Error('Unclosed CSV field');
        if (field || row.length) { row.push(field); rows.push(row); }
        const headers = rows.shift();
        if (!headers || rows.some(values => values.length !== headers.length)) throw new Error('Invalid CSV shape');
        return rows.map(values => Object.fromEntries(headers.map((key, index) => [key, values[index]])));
    }

    async function loadCSV(name) {
        const response = await fetch(`assets/research/huginn/${name}.csv`);
        if (!response.ok) throw new Error(`Could not load ${name}`);
        return parseCSV(await response.text());
    }

    function numeric(row, fields) {
        if (!row || fields.some(field => row[field] === '' || !Number.isFinite(Number(row[field])))) {
            throw new Error('Missing measurement');
        }
        return row;
    }

    function svgElement(name, attributes = {}, text = '') {
        const element = document.createElementNS('http://www.w3.org/2000/svg', name);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        if (text) element.textContent = text;
        return element;
    }

    function setupTrajectory(rows) {
        const data = rows.filter(row => row.model === 'latent_logistic_critical' && Number(row.R) === 32)
            .sort((a, b) => Number(a.loop) - Number(b.loop));
        if (data.length !== 32 || data.some((row, index) => Number(row.loop) !== index + 1)) throw new Error('Incomplete trajectory');
        data.forEach(row => numeric(row, ['balanced_accuracy', 'balanced_accuracy_ci_lower', 'balanced_accuracy_ci_upper']));
        const width = 640, height = 340, left = 48, right = 18, top = 22, bottom = 42;
        const x = loop => left + (Number(loop) - 1) / 31 * (width - left - right);
        const y = score => top + (1 - Number(score)) * (height - top - bottom);
        const svg = svgElement('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-labelledby': 'trajectory-title trajectory-description' });
        svg.append(svgElement('title', { id: 'trajectory-title' }, 'Path-label balanced accuracy across 32 recurrent loops'));
        svg.append(svgElement('desc', { id: 'trajectory-description' }, 'Linear probe accuracy rises around loops 9 to 12, peaks at 94.6 percent at loop 18, and ends at 86.5 percent. Shading is the original example-level 95 percent bootstrap interval.'));
        [0, .25, .5, .75, 1].forEach(score => {
            svg.append(svgElement('line', { x1: left, x2: width - right, y1: y(score), y2: y(score), stroke: score === .5 ? '#777' : '#dedfd8', 'stroke-dasharray': score === .5 ? '5 5' : 'none' }));
            svg.append(svgElement('text', { x: left - 10, y: y(score) + 5, 'text-anchor': 'end', fill: '#60645f', 'font-size': 13 }, `${score * 100}%`));
        });
        [1, 8, 16, 24, 32].forEach(loop => svg.append(svgElement('text', { x: x(loop), y: height - 20, 'text-anchor': 'middle', fill: '#60645f', 'font-size': 13 }, String(loop))));
        svg.append(svgElement('text', { x: width / 2, y: height - 1, 'text-anchor': 'middle', fill: '#60645f', 'font-size': 13 }, 'Recurrent loop'));
        const points = (values, key) => values.map(row => `${x(row.loop)},${y(row[key])}`).join(' ');
        svg.append(svgElement('polygon', { points: `${points(data, 'balanced_accuracy_ci_upper')} ${points([...data].reverse(), 'balanced_accuracy_ci_lower')}`, fill: '#21684f', 'fill-opacity': .12 }));
        svg.append(svgElement('polyline', { points: points(data, 'balanced_accuracy'), fill: 'none', stroke: '#21684f', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
        const cursor = svgElement('line', { class: 'chart-marker', x1: 0, x2: 0, y1: top, y2: height - bottom, stroke: '#21684f', 'stroke-opacity': .5, 'stroke-dasharray': '3 4' });
        const dot = svgElement('circle', { class: 'chart-marker', cx: 0, cy: 0, r: 5, fill: '#21684f', stroke: '#fdfbf7', 'stroke-width': 2 });
        svg.append(cursor, dot);
        byId('trajectory-chart').replaceChildren(svg);
        const slider = byId('loop-slider');
        function update() {
            const loop = Number(slider.value);
            const row = data[loop - 1];
            byId('loop-number').textContent = `Loop ${loop} / 32`;
            byId('loop-score').textContent = percent(row.balanced_accuracy);
            byId('loop-ci').textContent = `95% interval: ${interval(row.balanced_accuracy_ci_lower, row.balanced_accuracy_ci_upper)}`;
            byId('loop-context').textContent = loop <= 8
                ? 'Early-loop intervals include chance; the path is not reliably accessible to this probe yet.'
                : loop <= 12 ? 'The observed rise occurs around loops 9–12. This transition is exploratory.'
                    : 'The path is more accessible to the probe. This does not establish use by Huginn.';
            slider.setAttribute('aria-valuetext', `Loop ${loop}, balanced accuracy ${percent(row.balanced_accuracy)}`);
            cursor.style.transform = `translateX(${x(loop)}px)`;
            dot.style.transform = `translate(${x(loop)}px, ${y(row.balanced_accuracy)}px)`;
        }
        slider.disabled = false;
        slider.addEventListener('input', update);
        update();
    }

    function setupMonitors(main, miniLM) {
        [4, 8, 16, 32].forEach(depth => {
            numeric(main.find(row => Number(row.R) === depth), ['latent_probe_BA', 'text_monitor_BA', 'n_rmi_eligible', 'task_accuracy_test', 'task_accuracy_test_ci_lower', 'task_accuracy_test_ci_upper']);
            numeric(miniLM.find(row => Number(row.R) === depth), ['balanced_accuracy']);
        });
        const buttons = [...document.querySelectorAll('[data-depth]')];
        ['latent', 'tfidf', 'minilm'].forEach(name => {
            const bar = byId(`${name}-bar`);
            const initialScale = Number.parseFloat(bar.style.width) / 100;
            bar.style.width = '100%';
            bar.style.transform = `scaleX(${initialScale})`;
        });
        function update(depth) {
            const row = main.find(item => Number(item.R) === depth);
            const semantic = miniLM.find(item => Number(item.R) === depth);
            // main_results uses eligible, same-ID latent scores (not all-74 shallow scores).
            Object.entries({ latent: row.latent_probe_BA, tfidf: row.text_monitor_BA, minilm: semantic.balanced_accuracy }).forEach(([name, value]) => {
                byId(`${name}-bar`).style.transform = `scaleX(${Number(value)})`;
                byId(`${name}-score`).textContent = percent(value);
            });
            byId('cohort-note').textContent = `All three monitors use the same ${row.n_rmi_eligible} eligible test examples at R = ${depth}.`;
            byId('task-score').textContent = percent(row.task_accuracy_test);
            byId('task-ci').textContent = `95% interval: ${interval(row.task_accuracy_test_ci_lower, row.task_accuracy_test_ci_upper)} · all 74 test examples`;
            buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.depth) === depth)));
        }
        buttons.forEach(button => {
            button.disabled = false;
            button.addEventListener('click', () => {
                if (button.getAttribute('aria-pressed') === 'true') return;
                update(Number(button.dataset.depth));
                refreshReadout(document.querySelector('.task-readout'));
            });
        });
        update(16);
    }

    function setupPatching(rows) {
        const data = rows.filter(row => row.patch_type === 'counterfactual_donor' && Number(row.R) === 32);
        [1, 2, 4, 8, 16, 24, 32].forEach(loop => numeric(data.find(row => Number(row.patch_loop) === loop), ['flip_rate', 'n_flip_pairs', 'flip_ci_upper', 'mean_effect', 'effect_ci_lower', 'effect_ci_upper']));
        const select = byId('patch-loop');
        function update() {
            const row = data.find(item => Number(item.patch_loop) === Number(select.value));
            // n_flip_pairs is the denominator; numerator = observed rate × eligible pairs.
            byId('patch-flips').textContent = `${Math.round(Number(row.flip_rate) * Number(row.n_flip_pairs))} / ${row.n_flip_pairs}`;
            byId('patch-upper').textContent = percent(row.flip_ci_upper);
            byId('patch-margin').textContent = `Mean donor-directed logit-margin shift: ${number(row.mean_effect)}. 95% interval: ${number(row.effect_ci_lower)} to ${number(row.effect_ci_upper)}.`;
        }
        select.disabled = false;
        select.addEventListener('change', () => {
            update();
            traceFlow('.patch-flow > *');
            refreshReadout(byId('patch-margin'));
        });
        update();
    }

    function unavailable(target) {
        const message = document.createElement('p');
        message.className = 'readout-note';
        message.setAttribute('role', 'status');
        message.textContent = 'The interactive data could not load. The default summary is shown; use the source CSV link below for the full results.';
        target.append(message);
    }
    loadCSV('probe_by_loop').then(setupTrajectory).catch(() => unavailable(byId('trajectory-chart')));
    Promise.all([loadCSV('main_results'), loadCSV('minilm_text_monitor_results')])
        .then(([main, miniLM]) => setupMonitors(main, miniLM)).catch(() => unavailable(byId('monitor-chart')));
    loadCSV('patching_results').then(setupPatching).catch(() => unavailable(byId('patch-margin').parentElement));
})();
