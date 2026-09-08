(function () {
    'use strict';

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function parseCsv(text) {
        const lines = text.trim().split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) return [];
        const headers = lines[0].split(',');
        return lines.slice(1).map((line) => {
            const values = line.split(',');
            return headers.reduce((row, header, index) => {
                row[header] = values[index] ?? '';
                return row;
            }, {});
        });
    }

    async function loadCsv(path) {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Unable to load ${path}`);
        return parseCsv(await response.text());
    }

    function number(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function percent(value) {
        return `${(value * 100).toFixed(1)}%`;
    }

    function signed(value, digits = 4) {
        const prefix = value > 0 ? '+' : '';
        return `${prefix}${value.toFixed(digits)}`;
    }

    function svgElement(tag, attrs = {}) {
        const element = document.createElementNS(SVG_NS, tag);
        Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
        return element;
    }

    function pathFrom(points) {
        return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
    }

    function animateSelection(cursor, readout) {
        if (reducedMotion.matches) return;
        cursor.getAnimations().forEach((animation) => animation.cancel());
        readout.getAnimations().forEach((animation) => animation.cancel());
        cursor.animate(
            [{ opacity: 0.35 }, { opacity: 1 }],
            { duration: 150, easing: 'ease-out' }
        );
        readout.animate(
            [{ opacity: 0.55, transform: 'translateY(2px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 180, easing: 'ease-out' }
        );
    }

    function buildObservabilityFigure(rows) {
        const section = document.getElementById('monitors');
        if (!section || document.getElementById('signal-example')) return;

        const data = rows
            .filter((row) => ['4', '8', '16', '32'].includes(row.R))
            .map((row) => ({
                depth: Number(row.R),
                state: number(row.latent_probe_BA),
                text: number(row.text_monitor_BA),
                task: number(row.task_accuracy_test),
            }))
            .filter((row) => [row.state, row.text, row.task].every((value) => value !== null))
            .sort((a, b) => a.depth - b.depth);

        if (data.length !== 4) return;

        const figure = document.createElement('figure');
        figure.id = 'signal-example';
        figure.className = 'dev-article-figure polish-example evidence-figure';
        figure.setAttribute('aria-labelledby', 'signal-example-title');
        figure.innerHTML = `
            <div class="figure-heading">
                <h3 id="signal-example-title">Where the observability gap opens</h3>
                <span>paired held-out measurements</span>
            </div>
            <p class="evidence-intro">At shallow recurrence, the state probe, text monitor, and model accuracy all sit near chance. The separation appears only after substantially more recurrent computation.</p>
            <div class="evidence-legend" aria-label="Series legend">
                <span class="state"><i></i>Internal-state probe</span>
                <span class="text"><i></i>Primary text monitor</span>
                <span class="task"><i></i>Huginn task accuracy</span>
            </div>
            <div class="evidence-chart" id="observability-evidence-chart"></div>
            <div class="evidence-controls" role="group" aria-label="Inspect recurrence depth">
                <span>Inspect depth</span>
                ${data.map((row) => `<button type="button" data-evidence-depth="${row.depth}" aria-pressed="${row.depth === 16 ? 'true' : 'false'}">R=${row.depth}</button>`).join('')}
            </div>
            <div class="evidence-readout" id="observability-evidence-readout" aria-live="polite">
                <div><span>State probe</span><strong data-readout="state"></strong></div>
                <div><span>Text monitor</span><strong data-readout="text"></strong></div>
                <div><span>Task accuracy</span><strong data-readout="task"></strong></div>
            </div>
            <p class="evidence-insight" data-readout="insight"></p>
            <figcaption>Measured values from <a href="assets/research/huginn/main_results.csv" download>main_results.csv</a>. The primary text-monitor line uses the paired text-monitor result in that table; Figure 2 above shows TF-IDF and MiniLM separately. Motion is only used when the reader changes the selected depth.</figcaption>
        `;

        section.appendChild(figure);

        const host = figure.querySelector('#observability-evidence-chart');
        const width = 720;
        const height = 300;
        const left = 72;
        const right = 28;
        const top = 24;
        const bottom = 46;
        const plotWidth = width - left - right;
        const plotHeight = height - top - bottom;
        const yMin = 0.35;
        const yMax = 1.0;
        const xFor = (index) => left + (plotWidth * index) / (data.length - 1);
        const yFor = (value) => top + ((yMax - value) / (yMax - yMin)) * plotHeight;

        const svg = svgElement('svg', {
            viewBox: `0 0 ${width} ${height}`,
            role: 'img',
            'aria-label': 'Line chart showing internal-state probe accuracy, primary text-monitor accuracy, and Huginn task accuracy across recurrence depths 4, 8, 16, and 32.',
        });
        svg.classList.add('evidence-svg');

        [0.4, 0.5, 0.6, 0.8, 1.0].forEach((tick) => {
            const y = yFor(tick);
            const line = svgElement('line', { x1: left, y1: y, x2: width - right, y2: y });
            line.classList.add('evidence-grid-line');
            if (tick === 0.5) line.classList.add('chance');
            svg.appendChild(line);
            const label = svgElement('text', { x: left - 12, y: y + 4, 'text-anchor': 'end' });
            label.classList.add('evidence-axis-label');
            label.textContent = `${Math.round(tick * 100)}%`;
            svg.appendChild(label);
        });

        data.forEach((row, index) => {
            const label = svgElement('text', { x: xFor(index), y: height - 16, 'text-anchor': 'middle' });
            label.classList.add('evidence-axis-label');
            label.textContent = `R=${row.depth}`;
            svg.appendChild(label);
        });

        const series = [
            { key: 'state', className: 'series-state' },
            { key: 'text', className: 'series-text' },
            { key: 'task', className: 'series-task' },
        ];

        series.forEach(({ key, className }) => {
            const group = svgElement('g');
            group.classList.add(className);
            const points = data.map((row, index) => ({ x: xFor(index), y: yFor(row[key]) }));
            const path = svgElement('path', { d: pathFrom(points) });
            path.classList.add('evidence-series-line');
            group.appendChild(path);
            points.forEach((point) => {
                const dot = svgElement('circle', { cx: point.x, cy: point.y, r: 3.8 });
                dot.classList.add('evidence-series-dot');
                group.appendChild(dot);
            });
            svg.appendChild(group);
        });

        const cursor = svgElement('g');
        cursor.classList.add('evidence-selection');
        const cursorLine = svgElement('line', { y1: top, y2: height - bottom });
        cursorLine.classList.add('evidence-selection-line');
        cursor.appendChild(cursorLine);
        const cursorDots = series.map(({ className }) => {
            const circle = svgElement('circle', { r: 6.2 });
            circle.classList.add('evidence-selection-dot', className);
            cursor.appendChild(circle);
            return circle;
        });
        svg.appendChild(cursor);
        host.appendChild(svg);

        const buttons = Array.from(figure.querySelectorAll('[data-evidence-depth]'));
        const readout = figure.querySelector('#observability-evidence-readout');
        const insight = figure.querySelector('[data-readout="insight"]');

        function selectDepth(depth, shouldAnimate) {
            const index = data.findIndex((row) => row.depth === depth);
            if (index < 0) return;
            const row = data[index];
            const x = xFor(index);
            cursorLine.setAttribute('x1', x);
            cursorLine.setAttribute('x2', x);
            cursorDots[0].setAttribute('cx', x);
            cursorDots[0].setAttribute('cy', yFor(row.state));
            cursorDots[1].setAttribute('cx', x);
            cursorDots[1].setAttribute('cy', yFor(row.text));
            cursorDots[2].setAttribute('cx', x);
            cursorDots[2].setAttribute('cy', yFor(row.task));

            buttons.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.evidenceDepth) === depth)));
            readout.querySelector('[data-readout="state"]').textContent = percent(row.state);
            readout.querySelector('[data-readout="text"]').textContent = percent(row.text);
            readout.querySelector('[data-readout="task"]').textContent = percent(row.task);

            const gap = (row.state - row.text) * 100;
            const direction = gap >= 0 ? 'above' : 'below';
            insight.textContent = `At R=${depth}, the state probe is ${Math.abs(gap).toFixed(1)} percentage points ${direction} the primary text monitor. This is a measurement gap, not evidence by itself that the decoded feature is causally used.`;

            if (shouldAnimate) animateSelection(cursor, readout);
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => selectDepth(Number(button.dataset.evidenceDepth), true));
        });

        selectDepth(16, false);
    }

    function buildPatchingFigure(rows) {
        const section = document.getElementById('patching');
        if (!section || document.getElementById('causal-example')) return;

        const counterfactual = rows
            .filter((row) => row.patch_type === 'counterfactual_donor' && row.status === 'ok')
            .map((row) => ({
                loop: Number(row.patch_loop),
                mean: number(row.mean_effect),
                lower: number(row.effect_ci_lower),
                upper: number(row.effect_ci_upper),
                flips: Number(row.n_flip_pairs),
                pairs: Number(row.n_pairs),
            }))
            .filter((row) => [row.mean, row.lower, row.upper].every((value) => value !== null))
            .sort((a, b) => a.loop - b.loop);

        const unrelated = rows
            .filter((row) => row.patch_type === 'unrelated_donor' && row.status === 'ok')
            .map((row) => ({
                loop: Number(row.patch_loop),
                mean: number(row.mean_effect),
                lower: number(row.effect_ci_lower),
                upper: number(row.effect_ci_upper),
            }))
            .filter((row) => [row.mean, row.lower, row.upper].every((value) => value !== null))
            .sort((a, b) => a.loop - b.loop);

        if (!counterfactual.length || counterfactual.length !== unrelated.length) return;

        const figure = document.createElement('figure');
        figure.id = 'causal-example';
        figure.className = 'dev-article-figure polish-example evidence-figure';
        figure.setAttribute('aria-labelledby', 'causal-example-title');
        figure.innerHTML = `
            <div class="figure-heading">
                <h3 id="causal-example-title">What the intervention actually moved</h3>
                <span>R=32 · measured patching effects</span>
            </div>
            <p class="evidence-intro">The causal question is not whether a probe can read the state. It is whether replacing that state moves the answer more than a control intervention does.</p>
            <div class="evidence-legend" aria-label="Series legend">
                <span class="state"><i></i>Counterfactual donor</span>
                <span class="control"><i></i>Unrelated-donor control</span>
            </div>
            <div class="evidence-chart" id="patch-evidence-chart"></div>
            <div class="evidence-controls" role="group" aria-label="Inspect patch loop">
                <span>Inspect loop</span>
                ${counterfactual.map((row) => `<button type="button" data-evidence-loop="${row.loop}" aria-pressed="${row.loop === 16 ? 'true' : 'false'}">${row.loop}</button>`).join('')}
            </div>
            <div class="evidence-readout evidence-readout-two" id="patch-evidence-readout" aria-live="polite">
                <div><span>Counterfactual donor</span><strong data-patch-readout="counterfactual"></strong><small data-patch-ci="counterfactual"></small></div>
                <div><span>Unrelated donor</span><strong data-patch-readout="control"></strong><small data-patch-ci="control"></small></div>
            </div>
            <p class="evidence-insight" data-patch-readout="insight"></p>
            <figcaption>Mean donor-directed logit-margin effect with the reported confidence intervals from <a href="assets/research/huginn/patching_results.csv" download>patching_results.csv</a>. The zero line is the no-shift reference. Counterfactual donor patches produced zero donor-directed answer flips at every tested loop.</figcaption>
        `;

        section.appendChild(figure);

        const host = figure.querySelector('#patch-evidence-chart');
        const width = 720;
        const height = 320;
        const left = 78;
        const right = 28;
        const top = 24;
        const bottom = 50;
        const plotWidth = width - left - right;
        const plotHeight = height - top - bottom;
        const allBounds = counterfactual.flatMap((row) => [row.lower, row.upper]).concat(unrelated.flatMap((row) => [row.lower, row.upper]), [0]);
        const rawMin = Math.min(...allBounds);
        const rawMax = Math.max(...allBounds);
        const span = Math.max(rawMax - rawMin, 0.02);
        const yMin = rawMin - span * 0.12;
        const yMax = rawMax + span * 0.12;
        const xFor = (index) => left + (plotWidth * index) / (counterfactual.length - 1);
        const yFor = (value) => top + ((yMax - value) / (yMax - yMin)) * plotHeight;

        const svg = svgElement('svg', {
            viewBox: `0 0 ${width} ${height}`,
            role: 'img',
            'aria-label': 'Line and interval chart comparing counterfactual-donor and unrelated-donor logit-margin effects across patch loops.',
        });
        svg.classList.add('evidence-svg');

        const zeroY = yFor(0);
        const zero = svgElement('line', { x1: left, y1: zeroY, x2: width - right, y2: zeroY });
        zero.classList.add('evidence-grid-line', 'zero');
        svg.appendChild(zero);
        const zeroLabel = svgElement('text', { x: left - 12, y: zeroY + 4, 'text-anchor': 'end' });
        zeroLabel.classList.add('evidence-axis-label');
        zeroLabel.textContent = '0';
        svg.appendChild(zeroLabel);

        [yMin, yMax].forEach((tick) => {
            const y = yFor(tick);
            const label = svgElement('text', { x: left - 12, y: y + 4, 'text-anchor': 'end' });
            label.classList.add('evidence-axis-label');
            label.textContent = signed(tick, 2);
            svg.appendChild(label);
        });

        counterfactual.forEach((row, index) => {
            const label = svgElement('text', { x: xFor(index), y: height - 16, 'text-anchor': 'middle' });
            label.classList.add('evidence-axis-label');
            label.textContent = `L${row.loop}`;
            svg.appendChild(label);
        });

        function drawPatchSeries(data, className) {
            const group = svgElement('g');
            group.classList.add(className);
            const points = data.map((row, index) => ({ x: xFor(index), y: yFor(row.mean) }));
            const path = svgElement('path', { d: pathFrom(points) });
            path.classList.add('evidence-series-line');
            group.appendChild(path);

            data.forEach((row, index) => {
                const x = xFor(index);
                const upper = yFor(row.upper);
                const lower = yFor(row.lower);
                const whisker = svgElement('line', { x1: x, y1: upper, x2: x, y2: lower });
                whisker.classList.add('evidence-whisker');
                group.appendChild(whisker);
                [upper, lower].forEach((y) => {
                    const cap = svgElement('line', { x1: x - 5, y1: y, x2: x + 5, y2: y });
                    cap.classList.add('evidence-whisker');
                    group.appendChild(cap);
                });
                const dot = svgElement('circle', { cx: x, cy: yFor(row.mean), r: 3.8 });
                dot.classList.add('evidence-series-dot');
                group.appendChild(dot);
            });
            svg.appendChild(group);
        }

        drawPatchSeries(counterfactual, 'series-state');
        drawPatchSeries(unrelated, 'series-control');

        const cursor = svgElement('g');
        cursor.classList.add('evidence-selection');
        const cursorLine = svgElement('line', { y1: top, y2: height - bottom });
        cursorLine.classList.add('evidence-selection-line');
        cursor.appendChild(cursorLine);
        const donorDot = svgElement('circle', { r: 6.2 });
        donorDot.classList.add('evidence-selection-dot', 'series-state');
        const controlDot = svgElement('circle', { r: 6.2 });
        controlDot.classList.add('evidence-selection-dot', 'series-control');
        cursor.appendChild(donorDot);
        cursor.appendChild(controlDot);
        svg.appendChild(cursor);
        host.appendChild(svg);

        const buttons = Array.from(figure.querySelectorAll('[data-evidence-loop]'));
        const readout = figure.querySelector('#patch-evidence-readout');
        const insight = figure.querySelector('[data-patch-readout="insight"]');

        function selectLoop(loop, shouldAnimate) {
            const index = counterfactual.findIndex((row) => row.loop === loop);
            if (index < 0) return;
            const donor = counterfactual[index];
            const control = unrelated[index];
            const x = xFor(index);
            cursorLine.setAttribute('x1', x);
            cursorLine.setAttribute('x2', x);
            donorDot.setAttribute('cx', x);
            donorDot.setAttribute('cy', yFor(donor.mean));
            controlDot.setAttribute('cx', x);
            controlDot.setAttribute('cy', yFor(control.mean));

            buttons.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.evidenceLoop) === loop)));
            readout.querySelector('[data-patch-readout="counterfactual"]').textContent = signed(donor.mean);
            readout.querySelector('[data-patch-ci="counterfactual"]').textContent = `95% interval ${signed(donor.lower)} to ${signed(donor.upper)}`;
            readout.querySelector('[data-patch-readout="control"]').textContent = signed(control.mean);
            readout.querySelector('[data-patch-ci="control"]').textContent = `95% interval ${signed(control.lower)} to ${signed(control.upper)}`;

            const donorCrossesZero = donor.lower <= 0 && donor.upper >= 0;
            const controlCrossesZero = control.lower <= 0 && control.upper >= 0;
            const overlap = donor.lower <= control.upper && control.lower <= donor.upper;
            insight.textContent = donorCrossesZero && controlCrossesZero && overlap
                ? `At loop ${loop}, both intervals cross zero and overlap one another. The intervention is not cleanly separated from the unrelated-donor control; donor-directed flips remain 0 / ${donor.pairs}.`
                : `At loop ${loop}, inspect the interval overlap before treating the mean shift as evidence of causal use; donor-directed flips remain 0 / ${donor.pairs}.`;

            if (shouldAnimate) animateSelection(cursor, readout);
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => selectLoop(Number(button.dataset.evidenceLoop), true));
        });

        selectLoop(16, false);
    }

    async function init() {
        if (!document.body.classList.contains('huginn-page')) return;
        try {
            const [mainResults, patchingResults] = await Promise.all([
                loadCsv('assets/research/huginn/main_results.csv'),
                loadCsv('assets/research/huginn/patching_results.csv'),
            ]);
            buildObservabilityFigure(mainResults);
            buildPatchingFigure(patchingResults);
        } catch (error) {
            console.warn('Huginn evidence interactions unavailable:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
