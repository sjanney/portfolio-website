(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const depths = [4, 8, 16, 32];
    const stages = [
        {
            id: 'prompt',
            label: 'Prompt',
            title: 'Prompt tokens enter the model',
            description: 'The input text is tokenized and embedded before recurrent computation begins.',
            changes: 'Token embeddings are created from the prompt.',
            fixed: 'No recurrent state has been updated yet.',
            state: 'input',
        },
        {
            id: 'prelude',
            label: 'Prelude',
            title: 'The prelude builds a prompt representation',
            description: 'The prelude transforms the embedded prompt into a representation, e, that remains available to the recurrent core.',
            changes: 'The prompt is converted into the representation e.',
            fixed: 'The recurrent core parameters are unchanged.',
            state: 'e',
        },
        {
            id: 'initialize',
            label: 'Initialize',
            title: 'Recurrent computation starts at h0',
            description: 'A seeded initial state h0 provides the starting point for iterative internal computation. It is distinct from the prompt representation e.',
            changes: 'The recurrent state is initialized to h0.',
            fixed: 'The prompt representation e remains available.',
            state: 'h0',
        },
        {
            id: 'loop-1',
            label: 'Loop 1',
            title: 'The shared core produces h1',
            description: 'The same recurrent core Gθ combines h0 with the prompt representation e to produce the next state h1.',
            changes: 'State advances from h0 to h1.',
            fixed: 'The weights θ and prompt representation e stay fixed.',
            state: 'h1',
        },
        {
            id: 'loop-2',
            label: 'Loop 2',
            title: 'The updated state returns to the same core',
            description: 'The model applies Gθ again, now using h1. The state evolves to h2 without generating a new text token.',
            changes: 'State advances from h1 to h2.',
            fixed: 'The same Gθ parameters are reused.',
            state: 'h2',
        },
        {
            id: 'loop-k',
            label: 'Loop k',
            title: 'Recurrence continues with shared parameters',
            description: 'At a general step k, h(k-1) and e are passed through the same core to produce hk. Recurrence adds computation, not new model weights.',
            changes: 'The latent state continues to evolve across loops.',
            fixed: 'Prompt, checkpoint, and recurrent-core weights remain fixed.',
            state: 'hk',
        },
        {
            id: 'final',
            label: 'Final state',
            title: 'The recurrence budget determines the final state',
            description: 'After R updates, recurrence stops at hR. In this study R is set to 4, 8, 16, or 32 while the model weights remain unchanged.',
            changes: 'The amount of test-time recurrent computation is set by R.',
            fixed: 'The model checkpoint and prompt remain the same.',
            state: 'hR',
        },
        {
            id: 'coda',
            label: 'Readout',
            title: 'The coda reads the final recurrent state',
            description: 'The coda transforms hR into output-space features after recurrent computation has finished.',
            changes: 'The final recurrent state is converted for token prediction.',
            fixed: 'No additional recurrent update is performed here.',
            state: 'hR',
        },
        {
            id: 'output',
            label: 'Output',
            title: 'The output head scores the next token',
            description: 'The readout is mapped to next-token logits. If generation continues, the overall process repeats for the next token position.',
            changes: 'A distribution over the next token is produced.',
            fixed: 'The completed recurrent trajectory for this token is not rewritten.',
            state: 'logits',
        },
    ];

    function stopLegacyWalkthrough(figure) {
        const play = figure.querySelector('#model-play');
        if (play && play.getAttribute('aria-pressed') === 'true') play.click();
    }

    function createFigure() {
        const oldFigure = document.querySelector('.model-walkthrough');
        if (!oldFigure || document.getElementById('architecture-explorer')) return null;
        stopLegacyWalkthrough(oldFigure);

        const figure = document.createElement('figure');
        figure.id = 'architecture-explorer';
        figure.className = 'dev-article-figure architecture-explorer';
        figure.setAttribute('aria-labelledby', 'architecture-explorer-title');
        figure.innerHTML = `
            <div class="figure-heading">
                <h3 id="architecture-explorer-title">How recurrent computation unfolds</h3>
                <span>Huginn · structural view</span>
            </div>
            <p class="architecture-intro">Follow one token position through the model. The diagram separates the fixed prompt representation from the recurrent state that changes on every loop.</p>

            <div class="architecture-map" role="img" aria-label="Prompt tokens pass through a prelude into a shared recurrent core. The core repeatedly updates hidden state h while reusing the same parameters and prompt representation. The final state passes through a coda to next-token logits.">
                <div class="architecture-node" data-architecture-node="prompt">
                    <span>input</span><strong>Prompt tokens</strong><small>x1 ... xn</small>
                </div>
                <div class="architecture-link" aria-hidden="true"></div>
                <div class="architecture-node" data-architecture-node="prelude">
                    <span>encode</span><strong>Prelude</strong><small>prompt representation e</small>
                </div>
                <div class="architecture-link" aria-hidden="true"></div>
                <div class="architecture-core" data-architecture-node="core">
                    <div class="architecture-core-meta"><span>shared recurrent core</span><strong>Gθ</strong><small>same parameters every loop</small></div>
                    <div class="architecture-state-lanes">
                        <div><span>prompt lane</span><strong>e</strong><small>held fixed across recurrence</small></div>
                        <div class="state-lane"><span>state lane</span><strong id="architecture-state">h0</strong><small id="architecture-state-note">initialized recurrent state</small></div>
                    </div>
                    <div class="architecture-equation">h<sub>k</sub> = G<sub>θ</sub>(h<sub>k-1</sub>, e)</div>
                </div>
                <div class="architecture-link" aria-hidden="true"></div>
                <div class="architecture-node" data-architecture-node="coda">
                    <span>read</span><strong>Coda</strong><small>final state hR</small>
                </div>
                <div class="architecture-link" aria-hidden="true"></div>
                <div class="architecture-node" data-architecture-node="output">
                    <span>predict</span><strong>Output head</strong><small>next-token logits</small>
                </div>
            </div>

            <div class="architecture-stage-controls" role="group" aria-label="Inspect a stage of recurrent computation">
                <span>Inspect stage</span>
                <div class="architecture-stage-rail">
                    ${stages.map((stage, index) => `<button type="button" data-architecture-stage="${index}" aria-pressed="${index === 0 ? 'true' : 'false'}">${stage.label}</button>`).join('')}
                </div>
            </div>

            <div class="architecture-readout" aria-live="polite">
                <div class="architecture-readout-heading"><span id="architecture-stage-index">01 / 09</span><strong id="architecture-stage-title"></strong></div>
                <p id="architecture-stage-description"></p>
                <div class="architecture-delta">
                    <div><span>What changes</span><strong id="architecture-changes"></strong></div>
                    <div><span>What stays fixed</span><strong id="architecture-fixed"></strong></div>
                </div>
            </div>

            <div class="architecture-depth-view">
                <div class="architecture-depth-heading">
                    <div><span>test-time compute knob</span><strong>What changes when recurrence depth increases</strong></div>
                    <p>The architecture and weights stay the same. Only the number of applications of Gθ changes.</p>
                </div>
                <div class="architecture-depth-controls" role="group" aria-label="Select recurrence depth">
                    ${depths.map((depth) => `<button type="button" data-architecture-depth="${depth}" aria-pressed="${depth === 16 ? 'true' : 'false'}">R=${depth}</button>`).join('')}
                </div>
                <div class="architecture-depth-ruler" aria-hidden="true">
                    <div class="architecture-depth-base"></div>
                    <div class="architecture-depth-progress" id="architecture-depth-progress"></div>
                    <div class="architecture-depth-marker" id="architecture-depth-marker"><span id="architecture-depth-marker-label">h16</span></div>
                    <span class="depth-tick tick-0">h0</span>
                    <span class="depth-tick tick-4">4</span>
                    <span class="depth-tick tick-8">8</span>
                    <span class="depth-tick tick-16">16</span>
                    <span class="depth-tick tick-32">32 loops</span>
                </div>
                <div class="architecture-depth-readout" aria-live="polite">
                    <strong id="architecture-depth-title">R = 16 · 16 recurrent updates</strong>
                    <p id="architecture-depth-copy">The final state is h16. The same Gθ parameters are applied on every update before the coda reads the result.</p>
                </div>
            </div>

            <div class="architecture-experiment-note">
                <span>Why this matters for the experiment</span>
                <p>The model weights are held fixed while the recurrence budget R varies at test time. This isolates additional recurrent computation from changes in checkpoint or prompt. The measured loop-by-loop probe trajectory below asks what becomes linearly decodable as that state evolves.</p>
                <a href="#trajectory">See the measured trajectory</a>
            </div>
            <figcaption>Structural diagram, not a visualization of measured activations. State labels describe Huginn's recurrent computation; the quantitative figures later on this page are loaded from the study's saved CSV artifacts.</figcaption>
        `;

        oldFigure.replaceWith(figure);
        return figure;
    }

    function cancelAnimations(root) {
        if (!root) return;
        root.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    }

    function cue(element, keyframes) {
        if (!element || reducedMotion.matches || !element.animate) return;
        element.getAnimations().forEach((animation) => animation.cancel());
        element.animate(keyframes, {
            duration: 300,
            easing: 'cubic-bezier(.22, 1, .36, 1)',
        });
    }

    function wireStageInspector(figure) {
        const buttons = Array.from(figure.querySelectorAll('[data-architecture-stage]'));
        const title = figure.querySelector('#architecture-stage-title');
        const description = figure.querySelector('#architecture-stage-description');
        const indexLabel = figure.querySelector('#architecture-stage-index');
        const changes = figure.querySelector('#architecture-changes');
        const fixed = figure.querySelector('#architecture-fixed');
        const state = figure.querySelector('#architecture-state');
        const stateNote = figure.querySelector('#architecture-state-note');
        let selected = 0;

        function activeNodeFor(stage) {
            if (stage.id === 'prompt') return 'prompt';
            if (stage.id === 'prelude') return 'prelude';
            if (stage.id === 'coda') return 'coda';
            if (stage.id === 'output') return 'output';
            return 'core';
        }

        function stateNoteFor(stage) {
            if (stage.id === 'initialize') return 'initialized recurrent state';
            if (stage.id.startsWith('loop')) return 'state after this recurrent update';
            if (stage.id === 'final' || stage.id === 'coda') return 'final recurrent state';
            if (stage.id === 'output') return 'mapped to token scores';
            if (stage.id === 'prelude') return 'prompt representation is now available';
            return 'recurrence has not started';
        }

        function select(next, shouldAnimate) {
            if (next < 0 || next >= stages.length || (next === selected && shouldAnimate)) return;
            const stage = stages[next];
            buttons.forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === next)));
            figure.querySelectorAll('[data-architecture-node]').forEach((node) => {
                node.classList.toggle('is-active', node.dataset.architectureNode === activeNodeFor(stage));
            });
            title.textContent = stage.title;
            description.textContent = stage.description;
            indexLabel.textContent = `${String(next + 1).padStart(2, '0')} / ${String(stages.length).padStart(2, '0')}`;
            changes.textContent = stage.changes;
            fixed.textContent = stage.fixed;
            state.textContent = stage.state;
            stateNote.textContent = stateNoteFor(stage);
            figure.dataset.architectureStage = stage.id;

            if (shouldAnimate) {
                cue(figure.querySelector(`[data-architecture-node="${activeNodeFor(stage)}"]`), [
                    { transform: 'translateY(3px)', opacity: 0.72 },
                    { transform: 'translateY(0)', opacity: 1 },
                ]);
                cue(figure.querySelector('.architecture-readout'), [
                    { opacity: 0.58, transform: 'translateY(3px)' },
                    { opacity: 1, transform: 'translateY(0)' },
                ]);
            }
            selected = next;
        }

        buttons.forEach((button, buttonIndex) => {
            button.addEventListener('click', () => select(buttonIndex, true));
            button.addEventListener('keydown', (event) => {
                if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
                event.preventDefault();
                const direction = event.key === 'ArrowRight' ? 1 : -1;
                const next = (buttonIndex + direction + buttons.length) % buttons.length;
                buttons[next].focus();
                select(next, true);
            });
        });
        select(0, false);
    }

    function wireDepthInspector(figure) {
        const buttons = Array.from(figure.querySelectorAll('[data-architecture-depth]'));
        const progress = figure.querySelector('#architecture-depth-progress');
        const marker = figure.querySelector('#architecture-depth-marker');
        const markerLabel = figure.querySelector('#architecture-depth-marker-label');
        const title = figure.querySelector('#architecture-depth-title');
        const copy = figure.querySelector('#architecture-depth-copy');
        let selected = 16;

        function position(depth) {
            return `${(depth / 32) * 100}%`;
        }

        function select(depth, focusMoved) {
            if (!depths.includes(depth) || depth === selected && focusMoved === false) return;
            buttons.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.architectureDepth) === depth)));
            progress.style.width = position(depth);
            marker.style.left = position(depth);
            markerLabel.textContent = `h${depth}`;
            title.textContent = `R = ${depth} · ${depth} recurrent updates`;
            copy.textContent = `The final state is h${depth}. The same Gθ parameters are applied on every update before the coda reads the result.`;
            selected = depth;
        }

        buttons.forEach((button, buttonIndex) => {
            button.addEventListener('click', () => select(Number(button.dataset.architectureDepth), true));
            button.addEventListener('keydown', (event) => {
                if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
                event.preventDefault();
                const direction = event.key === 'ArrowRight' ? 1 : -1;
                const next = (buttonIndex + direction + buttons.length) % buttons.length;
                buttons[next].focus();
                select(Number(buttons[next].dataset.architectureDepth), true);
            });
        });
        select(16, true);
    }

    function init() {
        if (!document.body.classList.contains('huginn-page')) return;
        const figure = createFigure();
        if (!figure) return;
        wireStageInspector(figure);
        wireDepthInspector(figure);
        reducedMotion.addEventListener?.('change', (event) => {
            if (event.matches) cancelAnimations(figure);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();