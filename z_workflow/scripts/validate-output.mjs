#!/usr/bin/env node
/**
 * Validate agent output HTML/CSS against section-composites.json archetype gates.
 *
 * Usage:
 *   node z_workflow/scripts/validate-output.mjs --slug embedded-sales-analytics
 *   node z_workflow/scripts/validate-output.mjs --dir output/cloud-analytics-tools --archetype comparison-guide
 *   node z_workflow/scripts/validate-output.mjs --from-state
 *   node z_workflow/scripts/validate-output.mjs --slug foo --json
 *
 * Exit 0 = pass, 1 = fail.
 */

import fs from 'fs';
import path from 'path';
import { resolveArchetype } from './composite-utils.mjs';
import { enrichBriefInventory, inventoryOutput, checkOutputInventory } from './inventory-checks.mjs';
import { ROOT, STATE_FILE, isScriptMain } from './workflow-paths.mjs';

function parseArgs(argv) {
  const args = { slug: null, dir: null, archetype: null, fromState: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--slug' && argv[i + 1]) args.slug = argv[++i];
    else if (argv[i] === '--dir' && argv[i + 1]) args.dir = argv[++i];
    else if (argv[i] === '--archetype' && argv[i + 1]) args.archetype = argv[++i];
    else if (argv[i] === '--from-state') args.fromState = true;
    else if (argv[i] === '--json') args.json = true;
  }
  return args;
}

function resolveOutputDir(args) {
  if (args.dir) {
    return path.isAbsolute(args.dir) ? args.dir : path.join(ROOT, args.dir.replace(/^[/\\]/, ''));
  }

  let slug = args.slug;
  let archetype = args.archetype;

  if (args.fromState && fs.existsSync(STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    slug = slug || state.page_slug;
    archetype = archetype || state.writer_brief?.archetype || state.similarity?.archetype;
  }

  if (!slug) {
    throw new Error('Pass --slug <page-slug>, --dir output/…, or --from-state with state.json');
  }

  return {
    dir: path.join(ROOT, 'output', slug),
    slug,
    archetype
  };
}

export function validateOutputDir(outputDir, options = {}) {
  const indexPath = path.join(outputDir, 'index.html');
  const cssPath = path.join(outputDir, 'style.css');

  if (!fs.existsSync(indexPath)) {
    return {
      pass: false,
      output_dir: outputDir,
      errors: [`Missing index.html at ${indexPath}`],
      warnings: []
    };
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';

  let archetypeId = options.archetype;
  let composite = null;

  const briefPath = options.briefPath ||
    (options.slug ? path.join(ROOT, 'z_workflow', 'briefs', `${options.slug}.txt`) : null);

  if (!archetypeId && briefPath && fs.existsSync(briefPath)) {
    const briefText = fs.readFileSync(briefPath, 'utf8');
    const resolved = resolveArchetype(briefText);
    if (resolved) {
      archetypeId = resolved.id;
      composite = resolved.composite;
    }
  }

  if (archetypeId && !composite) {
    const resolved = resolveArchetype('', archetypeId);
    composite = resolved.composite;
  }

  if (!composite) {
    return {
      pass: false,
      output_dir: outputDir,
      archetype: archetypeId,
      errors: ['No matching archetype — pass --archetype or ensure brief exists for slug'],
      warnings: []
    };
  }

  const outputInventory = inventoryOutput(html, css);

  let briefInventory = null;
  if (briefPath && fs.existsSync(briefPath)) {
    briefInventory = enrichBriefInventory(fs.readFileSync(briefPath, 'utf8'), composite);
  }

  const { issues, warnings, banner_audit } = checkOutputInventory(
    outputInventory,
    composite,
    { html, css },
    briefInventory
  );

  return {
    pass: issues.length === 0,
    output_dir: outputDir,
    slug: options.slug || path.basename(outputDir),
    archetype: archetypeId,
    inventory: outputInventory,
    brief_inventory: briefInventory,
    banner_audit,
    errors: issues,
    warnings
  };
}

function printReport(report) {
  console.log('OUTPUT VALIDATION');
  console.log('=================');
  console.log(`Dir:       ${report.output_dir}`);
  console.log(`Archetype: ${report.archetype || '(none)'}`);
  console.log(`Status:    ${report.pass ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log('HTML inventory:', JSON.stringify(report.inventory, null, 2));

  if (report.banner_audit) {
    console.log('\nBanner slot audit:', JSON.stringify(report.banner_audit, null, 2));
  }

  if (report.errors?.length) {
    console.log('\nErrors:');
    report.errors.forEach((e) => console.log(`  ✗ ${e}`));
  }

  if (report.warnings?.length) {
    console.log('\nWarnings:');
    report.warnings.forEach((w) => console.log(`  ! ${w}`));
  }
}

if (isScriptMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));

  try {
    const resolved = resolveOutputDir(args);
    const outputDir = typeof resolved === 'string' ? resolved : resolved.dir;
    const slug = typeof resolved === 'string' ? path.basename(resolved) : resolved.slug;
    const archetype = typeof resolved === 'string' ? args.archetype : resolved.archetype || args.archetype;

    const report = validateOutputDir(outputDir, { slug, archetype });

    const outPath = path.join(outputDir, 'validation.json');
    fs.writeFileSync(
      outPath,
      JSON.stringify({ ...report, validated_at: new Date().toISOString() }, null, 2) + '\n'
    );

    if (args.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printReport(report);
      console.log(`\nReport saved: ${outPath}`);
    }

    process.exit(report.pass ? 0 : 1);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
