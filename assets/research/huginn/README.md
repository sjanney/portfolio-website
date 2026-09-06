# Huginn research page: data provenance

Author: Shane Janney. Working paper, September 2026.

These are copies of the completed Huginn monitorability study's analysis artifacts,
not newly simulated or independently replicated measurements. The page's policy
toggle is a separate, hand-written teaching illustration. The page runs no model.

## Files

- [Paper](paper.pdf): the original 21-page manuscript, unchanged.
- [LaTeX source](latex-source.zip): manuscript and paper figures, unchanged.
- [Trajectory](probe_by_loop.csv): use `model=latent_logistic_critical`, `R=32`.
  All 32 loop points use the 74 held-out examples. The plot uses the original
  `balanced_accuracy_ci_lower` and `balanced_accuracy_ci_upper` columns.
- [Paired monitor results](main_results.csv): `latent_probe_BA` and
  `text_monitor_BA` use the same eligible test IDs at each R (55, 67, 74, 74).
  These are not the full-test shallow latent-probe scores. Task accuracy and its
  interval use all 74 test examples at each depth.
- [MiniLM results](minilm_text_monitor_results.csv): frozen all-MiniLM-L6-v2
  embeddings plus logistic classification on the rationale text, with FINAL lines
  removed. Same per-depth eligible test examples as the paired monitor results.
- [Patch results](patching_results.csv): the page selects `R=32` and
  `patch_type=counterfactual_donor`. `n_flip_pairs` is the flip-rate denominator,
  not the number of observed flips. The same 24 pairs are reused across loops.

Original locations: `outputs/main/tables/` in the Huginn monitorability project;
paper artifacts in `output/pdf/` and `output/latex/`.

## Interpretation

The supported result is **late linear decodability without demonstrated
behavioral use**. The original manuscript title omits “demonstrated”; the website
does not inherit that stronger claim. Neither the manuscript's format nor this
page claims conference acceptance.

Bootstrap intervals shown are the existing example-level intervals (2,000
resamples); they do not account for pair dependence by resampling whole pairs.
The late transition is exploratory. This is one checkpoint and task pairing,
with 74 held-out examples, no established above-chance task performance, and a
small patching study. No strict both-correct patch pairs were eligible.

## Artifact identity

- PDF SHA-256: `6b80ca3d642782267b9a0fcac477993e89b7a8819e2e129284f85db8ded90816`
- ZIP SHA-256: `2990096e6f17d6de5713587465feddd19f1f0d6a3a7628ec20e1fd2e38d85b94`
