#!/usr/bin/env node
// Diff two benchmark reports (head vs base) and render a PR comment + a GitHub job summary.
//
// Ports the comparison rules from base-ui's open-source compareBenchmarkReports.ts:
//   - "within noise" = |relative Δ of the metric| <= NOISE_THRESHOLD (0.2 / ±20%);
//   - a change is a regression/improvement only when it exceeds the threshold;
//   - totals are simple sums compared with the same rule.
// We apply the threshold to the IQR-filtered medians our harness already computes.
//
// Usage: node compare.mjs <head.json> <base.json> [--out <comment.md>]
//   head.json is required. base.json may be missing/empty (bootstrap period or a build that had no
//   perf app at the merge-base) — then we emit a "baseline unavailable" comment and exit 0.
//   If GITHUB_STEP_SUMMARY is set, the full table is appended there too.

import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const NOISE_THRESHOLD = 0.2;
const STICKY_MARKER = '<!-- radix-ng-benchmark -->';

function parseArgs(argv) {
    const positional = [];
    let out = 'benchmark-comment.md';
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--out') {
            out = argv[++i];
        } else {
            positional.push(argv[i]);
        }
    }
    return { headPath: positional[0], basePath: positional[1], out };
}

function readReport(path) {
    if (!path) {
        return null;
    }
    try {
        const parsed = JSON.parse(readFileSync(path, 'utf8'));
        return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch {
        return null;
    }
}

const ms = (n) => `${n.toFixed(1)} ms`;
const pct = (r) => `${r >= 0 ? '+' : ''}${(r * 100).toFixed(1)}%`;
const signedMs = (n) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(1)} ms`;

// Lower is better for time metrics: ▼ = improvement, ▲ = regression. Arrows only when significant.
function deltaMetric(head, base) {
    const absoluteDiff = head - base;
    const relativeDiff = base !== 0 ? absoluteDiff / base : 0;
    const withinNoise = Math.abs(relativeDiff) <= NOISE_THRESHOLD;
    let arrow = '';
    if (!withinNoise && absoluteDiff !== 0) {
        arrow = absoluteDiff > 0 ? ' ▲' : ' ▼';
    }
    return { absoluteDiff, relativeDiff, withinNoise, arrow };
}

// Render one time-metric cell (duration or paint). `nullText` is shown when the head stat is absent
// (paint can be null; duration is always present so it never hits that branch).
function metricCell(headStats, baseStats, nullText) {
    if (!headStats) {
        return { text: nullText, withinNoise: true };
    }
    if (!baseStats) {
        return { text: `${ms(headStats.median)} (new)`, withinNoise: false };
    }
    const d = deltaMetric(headStats.median, baseStats.median);
    return {
        text: `${ms(headStats.median)} ${signedMs(d.absoluteDiff)} (${pct(d.relativeDiff)})${d.arrow}`,
        withinNoise: d.withinNoise
    };
}

function rendersCell(head, base) {
    if (base === undefined) {
        return { text: `${head} (new)`, withinNoise: false };
    }
    const diff = head - base;
    return { text: `${head} (${diff >= 0 ? '+' : ''}${diff})`, withinNoise: diff === 0 };
}

function buildRows(head, base) {
    const baseByName = new Map((base ?? []).map((r) => [r.name, r]));
    const headNames = new Set(head.map((r) => r.name));

    const rows = head.map((h) => {
        const b = baseByName.get(h.name);
        const duration = metricCell(h.duration, b?.duration, '—');
        const paint = metricCell(h.paint, b?.paint, '—');
        const renders = rendersCell(h.renders, b?.renders);
        const significant = !duration.withinNoise || !paint.withinNoise || !renders.withinNoise;
        return { name: h.name, duration, paint, renders, significant, removed: false };
    });

    // Tests that existed at base but are gone at head.
    for (const b of base ?? []) {
        if (!headNames.has(b.name)) {
            rows.push({
                name: b.name,
                duration: { text: `~~${ms(b.duration.median)}~~ (removed)`, withinNoise: false },
                paint: { text: b.paint ? `~~${ms(b.paint.median)}~~` : '—', withinNoise: true },
                renders: { text: `~~${b.renders}~~`, withinNoise: true },
                significant: true,
                removed: true
            });
        }
    }
    return rows;
}

function totalsLine(head, base) {
    const sum = (rs, pick) => rs.reduce((acc, r) => acc + (pick(r) ?? 0), 0);
    const headDur = sum(head, (r) => r.duration.median);
    const headRenders = sum(head, (r) => r.renders);
    const headPaint = sum(head, (r) => r.paint?.median);
    // Paint total is only meaningful if every head row reported a paint; otherwise drop it rather
    // than print a sum of a partial set (or a misleading "0.0 ms" when none reported).
    const headPaintComplete = head.every((r) => r.paint);

    if (!base) {
        const paintSeg = headPaintComplete ? ` · **Paint:** ${ms(headPaint)}` : '';
        return `**Total duration:** ${ms(headDur)} · **Renders:** ${headRenders}${paintSeg}`;
    }
    const baseDur = sum(base, (r) => r.duration.median);
    const baseRenders = sum(base, (r) => r.renders);

    const dur = deltaMetric(headDur, baseDur);
    const rDiff = headRenders - baseRenders;

    let paintSeg = '';
    // Compare paint totals only over tests that reported a paint on BOTH sides, so a missing
    // Element Timing entry on one side can't fake a large total-paint delta.
    const baseByName = new Map(base.map((r) => [r.name, r]));
    const matched = head.filter((h) => h.paint && baseByName.get(h.name)?.paint);
    if (matched.length) {
        const headMatchedPaint = sum(matched, (r) => r.paint.median);
        const baseMatchedPaint = sum(matched, (h) => baseByName.get(h.name).paint.median);
        const paint = deltaMetric(headMatchedPaint, baseMatchedPaint);
        paintSeg = ` · **Paint:** ${ms(headMatchedPaint)} ${signedMs(paint.absoluteDiff)} (${pct(paint.relativeDiff)})${paint.arrow}`;
    }

    return (
        `**Total duration:** ${ms(headDur)} ${signedMs(dur.absoluteDiff)} (${pct(dur.relativeDiff)})${dur.arrow} · ` +
        `**Renders:** ${headRenders} (${rDiff >= 0 ? '+' : ''}${rDiff})${paintSeg}`
    );
}

function table(rows) {
    const header = '| Test | Duration | Renders | Paint |\n| --- | --- | --- | --- |';
    const body = rows.map((r) => `| ${r.name} | ${r.duration.text} | ${r.renders.text} | ${r.paint.text} |`);
    return [header, ...body].join('\n');
}

function render(head, base) {
    if (!head) {
        return `${STICKY_MARKER}\n### ⚡ Performance\n\nNo benchmark report was produced for this run.`;
    }
    if (!base) {
        const rows = buildRows(head, null);
        return [
            STICKY_MARKER,
            '### ⚡ Performance',
            '',
            '_Baseline unavailable (no benchmark report at the merge-base) — showing head numbers only._',
            '',
            totalsLine(head, null),
            '',
            table(rows)
        ].join('\n');
    }

    const rows = buildRows(head, base);
    const significant = rows.filter((r) => r.significant);
    const quiet = rows.filter((r) => !r.significant);

    const parts = [STICKY_MARKER, '### ⚡ Performance', '', totalsLine(head, base), ''];

    if (significant.length) {
        parts.push(table(significant));
    } else {
        parts.push('All benchmarks within noise (±20%). ✅');
    }

    if (quiet.length) {
        parts.push(
            '',
            `<details><summary>${quiet.length} test${quiet.length === 1 ? '' : 's'} within noise</summary>`,
            '',
            table(quiet),
            '',
            '</details>'
        );
    }

    parts.push(
        '',
        '<sub>Lower is better. ▲ regression · ▼ improvement · within-noise = |Δ| ≤ 20% of base median.</sub>'
    );
    return parts.join('\n');
}

const { headPath, basePath, out } = parseArgs(process.argv.slice(2));
const head = readReport(headPath);
const base = readReport(basePath);

const comment = render(head, base);

writeFileSync(out, `${comment}\n`);
if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${comment}\n`);
}
// Also print so the logs show the table even without a PR.
process.stdout.write(`${comment}\n`);
