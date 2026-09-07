import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Local authoring helper. Secrets stay in this process and are never copied to assets.
// Prefer the working IPv4 route; this host's default IPv6 route can time out.
dns.setDefaultResultOrder('ipv4first');
const buildDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(buildDir, '../../..');
const command = process.argv[2] || 'probe';
if (!['probe', 'generate'].includes(command)) throw new Error('Use probe or generate.');
const envPath = path.join(projectDir, '.env');
const values = new Map();
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(KIE_API_KEY|KIE_AI_API_KEY)\s*=\s*(.*?)\s*$/);
    if (match) values.set(match[1], match[2].replace(/^(['"])(.*)\1$/, '$2'));
  }
}
const key = process.env.KIE_AI_API_KEY || process.env.KIE_API_KEY || values.get('KIE_AI_API_KEY') || values.get('KIE_API_KEY');
if (!key) throw new Error('No KIE API key found in local environment.');
process.env.KIE_AI_API_KEY = key;

const scriptPath = path.join(projectDir, '.scroll-craft-source/plugins/nateherk-design/skills/scroll-craft/scripts/kie.mjs');
const auditPath = path.join(buildDir, 'generation-audit.json');
const audit = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, 'utf8')) : { provider: 'Kie.ai', events: [] };
const fetchImpl = globalThis.fetch;
globalThis.fetch = async (...args) => {
  const result = await fetchImpl(...args);
  const requestUrl = String(args[0]);
  if (requestUrl.startsWith('https://api.kie.ai/')) {
    const response = await result.clone().json().catch(() => null);
    let event;
    if (requestUrl.endsWith('/chat/credit')) event = { kind: 'credit-probe', code: response?.code, balance: response?.data };
    if (requestUrl.endsWith('/jobs/createTask')) event = { kind: 'create-task', code: response?.code, model: 'seedream/5-pro-text-to-image', taskId: response?.data?.taskId || null };
    if (requestUrl.includes('/jobs/recordInfo') && response?.data?.state === 'success') event = { kind: 'task-success', taskId: response.data.taskId || new URL(requestUrl).searchParams.get('taskId') };
    if (event) {
      audit.events.push({ at: new Date().toISOString(), ...event });
      fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n');
    }
  }
  return result;
};

if (command === 'generate') {
  if (!fs.existsSync(path.join(buildDir, 'BRIEF.md'))) throw new Error('BRIEF.md must exist before generation.');
  const originalPath = path.join(buildDir, 'originals/stochastic-kie.png');
  if (fs.existsSync(originalPath)) throw new Error('Original already exists; refusing an accidental paid rerun.');
  const prompt = fs.readFileSync(path.join(buildDir, 'stochastic-prompt.txt'), 'utf8').trim();
  process.argv = [process.execPath, scriptPath, 'still', prompt, originalPath, '--ar', '16:9', '--quality', 'high'];
} else {
  process.argv = [process.execPath, scriptPath, 'probe'];
}
await import(pathToFileURL(scriptPath).href);
