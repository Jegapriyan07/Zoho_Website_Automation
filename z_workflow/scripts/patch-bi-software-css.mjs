#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '../gold-snippets/bi-software-landing-layout.css');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/url\(\/\/www\.zohowebstatic\.com[^)]+\)/g, "url('https://prezohoweb.zoho.com/') /* TODO */");
c = c.replace(/url\(https:\/\/www\.zohowebstatic\.com[^)]+\)/g, "url('https://prezohoweb.zoho.com/') /* TODO */");
c = c.replace(/var\(--primaryfont-bold\)/g, 'var(--zf-primary-bold)');
c = c.replace(/var\(--primaryfont-semibold\)/g, 'var(--zf-primary-semibold)');
c = c.replace(/var\(--primaryfont-regular\)/g, 'var(--zf-primary-regular)');
c = c.replace(/var\(--primaryfont-light\)/g, 'var(--zf-primary-light)');
fs.writeFileSync(p, c);
console.log('patched', p, c.length);
