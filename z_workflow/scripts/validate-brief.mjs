#!/usr/bin/env node
/**
 * Validate a Writer brief against section-composites.json archetypes.
 *
 * Usage:
 *   node z_workflow/scripts/validate-brief.mjs --file z_workflow/briefs/client-dashboard-software.txt
 *   node z_workflow/scripts/validate-brief.mjs --file z_workflow/briefs/foo.txt --archetype agency-landing
 *   node z_workflow/scripts/validate-brief.mjs --file z_workflow/briefs/foo.txt --json
 *
 * Exit 0 = pass, 1 = fail (missing required strings or section inventory).
 */

import fs from 'fs';
import path from 'path';
import { resolveArchetype, getRequiredStrings } from './composite-utils.mjs';
import { enrichBriefInventory, inventoryBrief, checkBriefInventory } from './inventory-checks.mjs';
import { ROOT, isScriptMain } from './workflow-paths.mjs';

function parseArgs(argv) {
  const args = { file: null, archetype: null, json: false, minSteps: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--file' && argv[i + 1]) args.file = argv[++i];
    else if (argv[i] === '--archetype' && argv[i + 1]) args.archetype = argv[++i];
    else if (argv[i] === '--json') args.json = true;
    else if (argv[i] === '--min-steps' && argv[i + 1]) args.minSteps = parseInt(argv[++i], 10);
  }
  return args;
}

function checkRequiredStrings(briefText, required) {
  const norm = briefText.toLowerCase();
  const missing = [];
  const found = [];
  for (const raw of required || []) {
    const needle = raw.toLowerCase();
    if (norm.includes(needle)) found.push(raw);
    else missing.push(raw);
  }
  return { missing, found };
}

export function validateBriefFile(filePath, options = {}) {
  const briefText = fs.readFileSync(filePath, 'utf8');
  const resolved = resolveArchetype(briefText, options.archetype);

  if (!resolved) {
    return {
      pass: false,
      file: filePath,
      archetype: null,
      errors: ['No matching archetype in section-composites.json — add brief_signals or pass --archetype'],
      warnings: [],
      inventory: inventoryBrief(briefText)
    };
  }

  const { id, composite, score } = resolved;
  const required = [
    ...getRequiredStrings(composite),
    ...(composite.required_strings_extra || [])
  ];
  const uniqueRequired = [...new Set(required)];

  const { missing, found } = checkRequiredStrings(briefText, uniqueRequired);
  const inventory = enrichBriefInventory(briefText, composite);
  const sectionIssues = checkBriefInventory(inventory, composite);

  const errors = [];
  const warnings = [];

  if (missing.length) {
    errors.push(`Missing required strings (${missing.length}): ${missing.join(' · ')}`);
  }
  errors.push(...sectionIssues);

  if (options.minSteps != null && inventory.step_count < options.minSteps) {
    errors.push(`--min-steps ${options.minSteps}: only ${inventory.step_count} steps found`);
  }

  const thinPageMarkers = inventory.page_markers.length;
  if (composite.expected_page_count && thinPageMarkers < composite.expected_page_count) {
    warnings.push(`Only ${thinPageMarkers} --- PAGE N --- markers (expected ~${composite.expected_page_count})`);
  }

  return {
    pass: errors.length === 0,
    file: filePath,
    archetype: id,
    archetype_score: score,
    required_found: found,
    required_missing: missing,
    inventory,
    errors,
    warnings
  };
}

function printReport(report) {
  console.log('BRIEF VALIDATION');
  console.log('================');
  console.log(`File:      ${report.file}`);
  console.log(`Archetype: ${report.archetype || '(none)'}${report.archetype_score != null ? ` (signal score ${report.archetype_score})` : ''}`);
  console.log(`Status:    ${report.pass ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log('Inventory:', JSON.stringify(report.inventory, null, 2));

  if (report.required_missing?.length) {
    console.log('\nMissing required strings:');
    report.required_missing.forEach((s) => console.log(`  - ${s}`));
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
  if (!args.file) {
    console.error('Usage: node z_workflow/scripts/validate-brief.mjs --file z_workflow/briefs/{slug}.txt [--archetype id] [--json]');
    process.exit(1);
  }

  const resolvedPath = path.isAbsolute(args.file)
    ? args.file
    : path.join(ROOT, args.file.replace(/^[/\\]/, ''));

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Brief not found: ${args.file}`);
    process.exit(1);
  }

  const report = validateBriefFile(resolvedPath, {
    archetype: args.archetype,
    minSteps: args.minSteps
  });

  const outPath = resolvedPath.replace(/\.txt$/, '.validation.json');
  fs.writeFileSync(outPath, JSON.stringify({ ...report, validated_at: new Date().toISOString() }, null, 2) + '\n');

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
    console.log(`\nReport saved: ${outPath}`);
  }

  process.exit(report.pass ? 0 : 1);
}
