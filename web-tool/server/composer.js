import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { config } from './config.js';

// ── Phase 1 / 2 / 6 composer ───────────────────────────────────
// IMPORTANT: page composition (design tokens -> blueprint -> writing the 3
// files) is AGENT (LLM) work in this repo. There is no deterministic script
// for it, and the Rulesbook explicitly forbids reimplementing composition.
//
// So this module does NOT compose pages itself. It hands the build context to
// an external agent command (COMPOSER_CMD) and verifies the agent wrote the
// three files. If COMPOSER_CMD is unset, it returns a manual hard-stop signal
// instead of emitting garbage (acceptance criterion: no fake success).

const REQUIRED_FILES = ['index.html', 'style.css', 'script.js'];

export function outputDirFor(slug) {
  return path.join(config.pipelineRoot, 'output', slug);
}

export function outputFilesPresent(slug) {
  const dir = outputDirFor(slug);
  const html = path.join(dir, 'index.html');
  const css = path.join(dir, 'style.css');
  return fs.existsSync(html) && fs.existsSync(css);
}

/** Build the exact instruction the agent must follow (mirrors the workflow). */
export function buildComposerPrompt({ slug, briefFile, revise, archetype, composite }) {
  const base = [
    'You are the Zoho Web Page Builder agent operating inside the Web-pages repo.',
    'Follow z_workflow/AGENT-PROJECT-WORKFLOW.md (Phases 1, 2, 6), z_workflow/Rulesbook.md,',
    'and .cursor/rules/structure-first-pipeline.mdc EXACTLY. Compose, never clone.',
    '',
    `Brief file (only copy source): ${briefFile}`,
    `Read z_workflow/state.json for the similarity.source_map produced by Phase 0.`,
    '',
    'Do Phase 1 (design tokens) -> Phase 2 (blueprint) -> Phase 6 (write files).',
    `Write exactly three files into output/${slug}/: index.html, style.css, script.js.`,
    'Link ../../source/zohocustom.css + ../../source/product.css. Images from',
    'https://prezohoweb.zoho.com/ with <!-- TODO: replace with final asset --> markers.',
    'Nav/footer are comment placeholders only. Include the CTA visibility override.',
    'Every string in section-composites.json → archetype → cta_strings_required MUST appear',
    'as visible .cta-btn.act-btn button text in index.html.',
    'Update z_workflow/state.json phase_1 / phase_2 / phase_6 as you go.',
    'Do NOT run validate:output — the tool does that afterward.'
  ];

  if (archetype && composite?.section_order?.length) {
    base.push('');
    base.push(`ARCHETYPE (mandatory): ${archetype}`);
    base.push('Use EXACTLY these section root classes in order — wrong class names fail validation:');
    composite.section_order.forEach((s, i) => {
      const id = s.id ? ` id="${s.id}"` : '';
      const slot = s.banner_slot ? ` [banner_slot: ${s.banner_slot}]` : '';
      const cta = s.cta ? ` CTA: "${s.cta}"` : '';
      base.push(`  ${i + 1}. ${s.type}: <section class="${s.class}"${id}>${slot}${cta}`);
    });
    if (composite.cta_strings_required?.length) {
      base.push(`Required CTA button labels: ${composite.cta_strings_required.map((c) => `"${c}"`).join(', ')}`);
    }
  }
  if (revise) {
    base.push('');
    if (revise.scope === 'section' && revise.section_name) {
      base.push(`REVISE (section-scoped): rewrite ONLY the "${revise.section_name}" section and only the affected file(s).`);
    } else {
      base.push('REVISE (general): apply this change across the page, rewriting only affected file(s).');
    }
    base.push(`REVISE instruction: ${revise.instruction}`);
    base.push('Do not re-run Phase 0. Keep all other sections unchanged.');
  }
  return base.join('\n');
}

/**
 * Run the external composer command.
 * @returns {Promise<{ok:boolean, reason?:string, manual?:boolean}>}
 */
export function runComposer({ slug, briefFile, revise, archetype, composite, onLog }) {
  return new Promise((resolve) => {
    const prompt = buildComposerPrompt({ slug, briefFile, revise, archetype, composite });

    if (!config.composerSpawn) {
      onLog?.(
        'No COMPOSER_CMD configured. Phase 1/2/6 composition is agent (LLM) work and ' +
          'cannot be performed by a deterministic script.'
      );
      onLog?.('Build context prepared for a human/agent to compose:');
      onLog?.(prompt);
      return resolve({
        ok: false,
        manual: true,
        reason:
          'manual_compose_required: set COMPOSER_CMD (e.g. a Cursor CLI agent) so the tool ' +
          'can drive Phase 1/2/6 automatically, or compose output/' + slug + '/ by hand then Revise.'
      });
    }

    onLog?.(`Invoking composer: ${config.composerSpawn.label}`);

    runComposerProcess({ prompt, slug, onLog }).then(resolve);
  });
}

function runComposerProcess({ prompt, slug, onLog }) {
  return new Promise((resolve) => {
    const { bin, args, useShell } = config.composerSpawn;
    const child = spawn(bin, args, {
      cwd: config.pipelineRoot,
      env: {
        ...process.env,
        ZWPB_SLUG: slug,
        COMPOSER_MODEL: config.composerModel
      },
      shell: useShell,
      windowsHide: true
    });

    try {
      child.stdin.write(prompt);
      child.stdin.end();
    } catch {
      /* wrapper reads stdin */
    }

    child.stdout.on('data', (d) => onLog?.(d.toString()));
    child.stderr.on('data', (d) => onLog?.(d.toString()));

    child.on('error', (err) => {
      resolve({ ok: false, reason: `composer_spawn_failed: ${err.message}` });
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return resolve({
          ok: false,
          reason: `composer_exit_${code}: composition agent failed — retry the build; if it persists, check network/VPN and cursor-agent login`
        });
      }
      const missing = REQUIRED_FILES.filter(
        (f) => !fs.existsSync(path.join(outputDirFor(slug), f))
      );
      const criticalMissing = missing.filter((f) => f !== 'script.js');
      if (criticalMissing.length) {
        return resolve({
          ok: false,
          reason: `composer_missing_files: ${criticalMissing.join(', ')}`
        });
      }
      resolve({ ok: true });
    });
  });
}
