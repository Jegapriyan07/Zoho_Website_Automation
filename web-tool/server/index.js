import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { config, zohoConfigured, isDevAuthAllowed } from './config.js';
import { loadUser, registerAuthRoutes } from './auth-zoho.js';
import { registerApiRoutes } from './routes-api.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(loadUser);

registerAuthRoutes(app);
registerApiRoutes(app);

// Static SPA
app.use(express.static(config.publicDir));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/preview')) {
    return next();
  }
  res.sendFile(path.join(config.publicDir, 'index.html'));
});

function preflight() {
  const warnings = [];
  if (!fs.existsSync(path.join(config.pipelineRoot, 'z_workflow', 'scripts'))) {
    warnings.push(`Pipeline scripts not found under PIPELINE_ROOT (${config.pipelineRoot}).`);
  }
  if (!zohoConfigured()) {
    warnings.push('Zoho OAuth not configured — ' + (isDevAuthAllowed()
      ? 'local dev-login is ENABLED (localhost only).'
      : 'login will be unavailable until ZOHO_CLIENT_ID/SECRET are set.'));
  }
  if (!config.composerSpawn) {
    warnings.push('COMPOSER_CMD not set — Phase 1/2/6 will pause at a manual-compose hard stop.');
  } else if (/composer-runner/i.test(config.composerSpawn.label || '')) {
    warnings.push(`Composer: cursor-agent via resilient wrapper (model: ${config.composerModel}, auto-retry on connection loss).`);
  }
  return warnings;
}

app.listen(config.port, () => {
  console.log(`\nZoho Web Page Builder Tool`);
  console.log(`  ▶ ${config.appBaseUrl}`);
  console.log(`  pipeline root: ${config.pipelineRoot}`);
  for (const w of preflight()) console.log(`  ! ${w}`);
  console.log('');
});
