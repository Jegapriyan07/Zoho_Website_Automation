#!/usr/bin/env node
/**
 * Enhanced DOCX → brief text extractor.
 *
 * Extracts structured text from a .docx file by parsing word/document.xml.
 * Preserves:
 *   - Heading hierarchy (Heading1–Heading6 → "# / ## / ###" prefixes)
 *   - Bullet & numbered list items (→ "- " prefix)
 *   - Page break elements (w:br type="page", w:pageBreakBefore) → "--- PAGE N ---"
 *   - Table cell text (row by row)
 *   - Paragraph text with bold runs emphasized
 *   - All text verbatim so validate-brief required_strings checks pass
 *
 * Usage:
 *   node z_workflow/scripts/extract-docx.mjs <input.docx> <output.txt>
 *   node z_workflow/scripts/extract-docx.mjs <input.docx> <output.txt> --json
 *
 * No external npm dependencies — uses only Node built-ins.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { inventoryBrief } from './inventory-checks.mjs';
import { resolveArchetype } from './composite-utils.mjs';
import { isScriptMain } from './workflow-paths.mjs';

// ── XML helpers ────────────────────────────────────────────────

/** Extract the value of an XML attribute from a tag string. */
function attr(tagStr, name) {
  const re = new RegExp(`(?:w:|)${name}="([^"]*)"`, 'i');
  const m = tagStr.match(re);
  return m ? m[1] : null;
}

/** Strip all XML tags from a string. */
function stripTags(s) {
  return (s || '').replace(/<[^>]+>/g, '');
}

/** Collect all <w:t> text within a <w:r> run element (preserves xml:space="preserve"). */
function runText(runXml) {
  const parts = [];
  for (const m of runXml.matchAll(/<w:t(?:[^>]*)>([\s\S]*?)<\/w:t>/g)) {
    parts.push(m[1]);
  }
  return parts.join('');
}

// ── DOCX unzip ────────────────────────────────────────────────

function unzipDocx(docxPath) {
  const temp = path.join(os.tmpdir(), `docx-ext-${Date.now()}`);
  const unzipped = path.join(temp, 'out');
  fs.mkdirSync(unzipped, { recursive: true });
  const zipPath = path.join(temp, 'doc.zip');
  fs.copyFileSync(docxPath, zipPath);
  try {
    execSync(`tar -xf "${zipPath}" -C "${unzipped}"`, { stdio: 'pipe' });
  } catch {
    execSync(
      `powershell.exe -NoProfile -Command "Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${unzipped.replace(/'/g, "''")}' -Force"`,
      { stdio: 'pipe' }
    );
  }
  return unzipped;
}

function readDocumentXml(unzipped) {
  const p = path.join(unzipped, 'word', 'document.xml');
  if (!fs.existsSync(p)) throw new Error('word/document.xml not found in DOCX');
  return fs.readFileSync(p, 'utf8');
}

/** Read numbering.xml to understand list styles (optional, best-effort). */
function readNumberingXml(unzipped) {
  const p = path.join(unzipped, 'word', 'numbering.xml');
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

// ── Paragraph parsing ─────────────────────────────────────────

const HEADING_STYLES = {
  heading1: '#', heading2: '##', heading3: '###',
  heading4: '####', heading5: '#####', heading6: '######',
  title: '#', subtitle: '##'
};

/**
 * Parse a single <w:p> XML element into a structured paragraph.
 * @returns {{ style: string, text: string, hasPageBreak: boolean, isList: boolean }}
 */
function parseParagraph(pXml) {
  // ── Page break detection ───────────────────────────
  const hasExplicitPageBreak =
    /<w:br[^>]+w:type="page"/.test(pXml) ||
    /<w:lastRenderedPageBreak\/>/.test(pXml) ||
    /<w:pageBreakBefore\/>/.test(pXml) ||
    /<w:pageBreakBefore w:val="true"/.test(pXml) ||
    // paragraph-level page break property
    (/<w:pPr>[\s\S]*?<\/w:pPr>/.test(pXml) &&
      /<w:pageBreakBefore(?:\s*\/>|\s+w:val="true")/.test(
        (pXml.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/) || [])[0] || ''
      ));

  // ── Paragraph properties ───────────────────────────
  const pPr = (pXml.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/) || [])[1] || '';
  const styleMatch = pPr.match(/<w:pStyle w:val="([^"]+)"/);
  const rawStyle = styleMatch ? styleMatch[1] : '';
  const styleKey = rawStyle.toLowerCase().replace(/\s+/g, '');
  const headingPrefix = HEADING_STYLES[styleKey] || null;

  // ── List detection ─────────────────────────────────
  const isList = /<w:numPr>/.test(pPr);
  const ilvlMatch = pPr.match(/<w:ilvl w:val="(\d+)"/);
  const listLevel = ilvlMatch ? parseInt(ilvlMatch[1], 10) : 0;

  // ── Collect runs, skipping the paragraph properties block ──
  // We also skip <w:proofErr>, <w:bookmarkStart>, etc.
  const runsXml = pXml.replace(/<w:pPr>[\s\S]*?<\/w:pPr>/, '');

  // Split into runs — each <w:r>…</w:r> and also <w:hyperlink>…</w:hyperlink>
  const textParts = [];
  const runPattern = /<w:(?:r|hyperlink)[^>]*>([\s\S]*?)<\/w:(?:r|hyperlink)>/g;
  for (const m of runsXml.matchAll(runPattern)) {
    const inner = m[1];
    // skip deleted text
    if (/<w:delText/.test(inner)) continue;
    // skip drawing/image runs
    if (/<w:drawing/.test(inner)) continue;
    const t = runText(inner);
    if (t) textParts.push(t);
  }

  // Also grab any inline <w:t> not inside runs (edge case in some OOXML generators)
  const inlineT = runsXml.replace(/<w:r[^>]*>[\s\S]*?<\/w:r>/g, '');
  for (const m of inlineT.matchAll(/<w:t(?:[^>]*)>([\s\S]*?)<\/w:t>/g)) {
    if (m[1].trim()) textParts.push(m[1]);
  }

  let text = textParts.join('').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  return { style: rawStyle, headingPrefix, isList, listLevel, text, hasPageBreak: hasExplicitPageBreak };
}

// ── Table parsing ─────────────────────────────────────────────

/**
 * Parse a <w:tbl> element, extracting each row as a tab-separated line.
 */
function parseTable(tblXml) {
  const rows = [];
  for (const rowMatch of tblXml.matchAll(/<w:tr[ >]([\s\S]*?)<\/w:tr>/g)) {
    const cells = [];
    for (const cellMatch of rowMatch[1].matchAll(/<w:tc[ >]([\s\S]*?)<\/w:tc>/g)) {
      const cellText = [];
      for (const pMatch of cellMatch[1].matchAll(/<w:p[ >]([\s\S]*?)<\/w:p>/g)) {
        const { text } = parseParagraph(pMatch[0]);
        if (text) cellText.push(text);
      }
      cells.push(cellText.join(' '));
    }
    if (cells.some((c) => c.trim())) rows.push(cells.join('\t'));
  }
  return rows;
}

// ── Main extraction ───────────────────────────────────────────

/**
 * Parse word/document.xml and return structured brief text.
 * @param {string} xml - raw document.xml content
 * @returns {{ lines: string[], pageCount: number, charCount: number }}
 */
export function parseDocumentXml(xml) {
  const lines = [];
  let pageNum = 1;
  let prevLineWasPageBreak = false;

  // Process the <w:body> content only
  const bodyMatch = xml.match(/<w:body>([\s\S]*?)<\/w:body>/);
  const body = bodyMatch ? bodyMatch[1] : xml;

  // Walk top-level elements: paragraphs and tables
  // We use a regex that captures both <w:p> and <w:tbl> top-level blocks
  const blockRe = /<w:(p|tbl)([ >][\s\S]*?)<\/w:\1>/g;
  for (const m of body.matchAll(blockRe)) {
    const tag = m[1];
    const inner = `<w:${tag}${m[2]}</w:${tag}>`;

    if (tag === 'tbl') {
      const tableRows = parseTable(inner);
      if (tableRows.length) {
        lines.push('');
        lines.push(...tableRows);
        lines.push('');
      }
      continue;
    }

    // tag === 'p'
    const para = parseParagraph(inner);

    // Insert page break marker BEFORE the paragraph that triggers the break
    if (para.hasPageBreak && !prevLineWasPageBreak) {
      pageNum++;
      lines.push('');
      lines.push(`--- PAGE ${pageNum} ---`);
      lines.push('');
      prevLineWasPageBreak = true;
    } else {
      prevLineWasPageBreak = false;
    }

    if (!para.text) continue;

    // Format the line
    let line = para.text;
    if (para.headingPrefix) {
      line = `${para.headingPrefix} ${para.text}`;
    } else if (para.isList) {
      const indent = '  '.repeat(para.listLevel);
      line = `${indent}- ${para.text}`;
    }

    lines.push(line);
  }

  // Collapse 3+ blank lines to 2
  const collapsed = [];
  let blanks = 0;
  for (const l of lines) {
    if (!l.trim()) {
      blanks++;
      if (blanks <= 2) collapsed.push(l);
    } else {
      blanks = 0;
      collapsed.push(l);
    }
  }

  const text = collapsed.join('\n').trim();
  return {
    text,
    pageCount: pageNum,
    charCount: text.length
  };
}

// ── Public API ────────────────────────────────────────────────

/**
 * Extract text from a DOCX file and write a structured brief .txt.
 * @param {string} docxPath  - input .docx file
 * @param {string} outPath   - output .txt file
 * @param {{ title?: string }} [opts]
 * @returns {{ text: string, pageCount: number, charCount: number, archetypeGuess: string|null }}
 */
export function extractDocx(docxPath, outPath, opts = {}) {
  const unzipped = unzipDocx(docxPath);
  const xml = readDocumentXml(unzipped);
  const { text, pageCount, charCount } = parseDocumentXml(xml);

  const header = opts.title ? `${opts.title}\n\n` : '';
  const briefContent = header + text + '\n';

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, briefContent, 'utf8');

  const inventory = inventoryBrief(briefContent);
  const archetypeGuess = resolveArchetype(briefContent, opts.archetype || null);

  // Write sidecar .extract.json
  const sidecarPath = outPath.replace(/\.txt$/, '.extract.json');
  const sidecar = {
    extracted_at: new Date().toISOString(),
    source_file: docxPath,
    output_file: outPath,
    extraction_method: 'docx',
    page_count: pageCount,
    merged_length: charCount,
    footer_chars: null, // no Writer footer for DOCX
    per_page_lengths: [],
    quality: { warnings: [], errors: [] },
    inventory,
    archetype_guess: archetypeGuess ? archetypeGuess.id : null,
    writer_doc_title: opts.title || path.basename(docxPath, '.docx')
  };
  fs.writeFileSync(sidecarPath, JSON.stringify(sidecar, null, 2) + '\n');

  return {
    text: briefContent,
    pageCount,
    charCount,
    archetypeGuess: archetypeGuess || null,
    inventory,
    sidecarPath
  };
}

// ── CLI entry point ───────────────────────────────────────────

if (isScriptMain(import.meta.url)) {
  const args = process.argv.slice(2);
  const docx = args.find((a) => !a.startsWith('--'));
  const outIdx = args.indexOf('--out');
  const out = outIdx >= 0 ? args[outIdx + 1] : args.filter((a) => !a.startsWith('--'))[1];
  const isJson = args.includes('--json');
  const titleIdx = args.indexOf('--title');
  const title = titleIdx >= 0 ? args[titleIdx + 1] : '';

  if (!docx || !out) {
    console.error('Usage: node extract-docx.mjs <input.docx> <output.txt> [--title "Page Title"] [--json]');
    process.exit(1);
  }

  if (!fs.existsSync(docx)) {
    console.error(`DOCX not found: ${docx}`);
    process.exit(1);
  }

  try {
    const result = extractDocx(path.resolve(docx), path.resolve(out), { title });
    if (isJson) {
      console.log(JSON.stringify({
        pageCount: result.pageCount,
        charCount: result.charCount,
        archetype_guess: result.archetypeGuess?.id || null,
        inventory: result.inventory
      }, null, 2));
    } else {
      console.log(`✓ Extracted ${result.pageCount} page(s), ${result.charCount} chars → ${out}`);
      console.log(`  Archetype guess: ${result.archetypeGuess?.id || '(none)'}`);
      if (result.inventory.step_count) console.log(`  Steps: ${result.inventory.step_count}`);
      if (result.inventory.faq_count)  console.log(`  FAQ items: ${result.inventory.faq_count}`);
    }
    process.exit(0);
  } catch (e) {
    console.error('Extraction failed:', e.message);
    process.exit(1);
  }
}
