#!/usr/bin/env node
/**
 * Shared paths and helpers for z_workflow scripts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, '../..');
export const WORKFLOW = path.join(ROOT, 'z_workflow');
export const OUTPUT_DIR = path.join(ROOT, 'output');
export const SOURCE_DIR = path.join(ROOT, 'source');
export const REFERENCE_DIR_NAME = 'Reference-Site';
export const REFERENCE_DIR = path.join(ROOT, REFERENCE_DIR_NAME);
export const AGENT_REFERENCE_DIR_NAME = 'agent-reference';
export const AGENT_REFERENCE_DIR = path.join(REFERENCE_DIR, AGENT_REFERENCE_DIR_NAME);
export const PROMOTED_REGISTRY = path.join(WORKFLOW, 'promoted');
export const STATE_FILE = path.join(WORKFLOW, 'state.json');

/** Container folders inside Reference-Site/ — not pages themselves. */
export const REFERENCE_CONTAINER_DIRS = new Set([AGENT_REFERENCE_DIR_NAME]);

/** Top-level project dirs — not reference page folders. */
export const ROOT_SKIP_DIRS = new Set([
  '.cursor', 'docs', 'output', 'z_workflow', 'source',
  '.git', 'node_modules', 'terminals', 'Release-note', REFERENCE_DIR_NAME
]);

/** @deprecated use ROOT_SKIP_DIRS */
export const SKIP_DIRS = ROOT_SKIP_DIRS;

/**
 * Convert page slug to a reference folder name.
 * cloud-analytics-tools → Cloud-Analytics-Tools
 */
export function slugToFolderName(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-');
}

/**
 * All reference sites: legacy (Reference-Site root) + agent (agent-reference/).
 * @returns {{ site_name: string, dir: string, origin: 'legacy'|'agent', reference_path: string }[]}
 */
export function getReferenceSiteEntries() {
  const entries = [];

  if (fs.existsSync(REFERENCE_DIR)) {
    for (const d of fs.readdirSync(REFERENCE_DIR, { withFileTypes: true })) {
      if (!d.isDirectory() || REFERENCE_CONTAINER_DIRS.has(d.name)) continue;
      const dir = path.join(REFERENCE_DIR, d.name);
      if (fs.existsSync(path.join(dir, 'index.html'))) {
        entries.push({
          site_name: d.name,
          dir,
          origin: 'legacy',
          reference_path: d.name
        });
      }
    }
  }

  if (fs.existsSync(AGENT_REFERENCE_DIR)) {
    for (const d of fs.readdirSync(AGENT_REFERENCE_DIR, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const dir = path.join(AGENT_REFERENCE_DIR, d.name);
      if (fs.existsSync(path.join(dir, 'index.html'))) {
        entries.push({
          site_name: d.name,
          dir,
          origin: 'agent',
          reference_path: `${AGENT_REFERENCE_DIR_NAME}/${d.name}`
        });
      }
    }
  }

  return entries.sort((a, b) => a.site_name.localeCompare(b.site_name));
}

/** Folder names only (for backward-compatible matching). */
export function getReferenceSiteNames() {
  return getReferenceSiteEntries().map((e) => e.site_name);
}

/** Absolute path to a reference site folder by site name. */
export function getReferenceSiteDir(siteName) {
  const entry = getReferenceSiteEntries().find((e) => e.site_name === siteName);
  if (entry) return entry.dir;
  return path.join(REFERENCE_DIR, siteName);
}

export function getAgentReferenceTargetDir(folderName) {
  return path.join(AGENT_REFERENCE_DIR, folderName);
}

export function readState() {
  if (!fs.existsSync(STATE_FILE)) return null;
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

export function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

export function isScriptMain(importMetaUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  return path.resolve(fileURLToPath(importMetaUrl)) === path.resolve(entry);
}
