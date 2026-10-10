import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

function runCommand(cmd) {
  console.log(`\n⚙️ Executando: ${cmd}`);
  try {
    execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Falha no comando: ${cmd}`);
    process.exit(1);
  }
}

function bumpVersion(currentVersion) {
  const parts = currentVersion.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1; // Incrementa patch
  return parts.join('.');
}

function humanizeMessage(text) {
  if (!text) return 'Melhorias contínuas e otimizações na plataforma';
  let clean = text.trim();
  clean = clean.replace(/^[✨🚀📌🛠️🔧⚡🎨🔒•\-\s]+/, '');
  clean = clean
    .replace(/^feat(?:\([^)]*\))?:\s*/i, '')
    .replace(/^fix(?:\([^)]*\))?:\s*/i, '')
    .replace(/^bugfix(?:\([^)]*\))?:\s*/i, '')
    .replace(/^perf(?:\([^)]*\))?:\s*/i, '')
    .replace(/^refactor(?:\([^)]*\))?:\s*/i, '')
    .replace(/^style(?:\([^)]*\))?:\s*/i, '')
    .replace(/^chore(?:\([^)]*\))?:\s*/i, '')
    .replace(/^docs(?:\([^)]*\))?:\s*/i, '')
    .replace(/^build(?:\([^)]*\))?:\s*/i, '')
    .trim();
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean;
}

async function main() {
  const args = process.argv.slice(2);
  let explicitVersion = null;
  let keepCurrent = false;

  const filteredArgs = [];
  for (const arg of args) {
    if (arg.startsWith('--version=')) {
      explicitVersion = arg.replace('--version=', '').trim();
    } else if (arg === '--keep-version') {
      keepCurrent = true;
    } else {
      filteredArgs.push(arg);
    }
  }

  const rawChangeMessage = filteredArgs.join(' ') || 'Melhorias gerais e correções no sistema';
  const changeMessage = humanizeMessage(rawChangeMessage);

  console.log('=====================================================');
  console.log('🚀 Nex-Ai.NEFRO - Pipeline Automático de Release');
  console.log('=====================================================');

  // 1. Atualizar package.json
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const oldVersion = pkg.version || '1.1.2';
  
  let newVersion = oldVersion;
  if (explicitVersion) {
    newVersion = explicitVersion;
  } else if (!keepCurrent) {
    newVersion = bumpVersion(oldVersion);
  }
  
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`📌 Versão definida: v${newVersion}`);

  // 2. Atualizar src/version.js
  const versionJsPath = path.join(rootDir, 'src', 'version.js');
  const versionJsContent = `export const APP_VERSION = "${newVersion}";\nexport const LAST_DEPLOY = "${new Date().toISOString()}";\n`;
  fs.writeFileSync(versionJsPath, versionJsContent);

  // 3. Atualizar CHANGELOG.md
  const changelogPath = path.join(rootDir, 'CHANGELOG.md');
  const dateStr = new Date().toISOString().split('T')[0];
  const newEntry = `\n## [${newVersion}] - ${dateStr}\n### Alterações\n- ${changeMessage}\n`;
  
  if (fs.existsSync(changelogPath)) {
    const existing = fs.readFileSync(changelogPath, 'utf8');
    if (existing.includes(`## [${newVersion}]`)) {
      console.log(`ℹ️ Entrada [${newVersion}] já presente no CHANGELOG.md`);
    } else {
      const headerEnd = existing.indexOf('\n## [');
      if (headerEnd !== -1) {
        const updated = existing.slice(0, headerEnd) + newEntry + existing.slice(headerEnd);
        fs.writeFileSync(changelogPath, updated);
      } else {
        fs.appendFileSync(changelogPath, newEntry);
      }
      console.log(`📝 CHANGELOG.md atualizado com sucesso.`);
    }
  } else {
    fs.writeFileSync(changelogPath, `# Registro de Mudanças (Changelog) - Nex-Ai.NEFRO\n${newEntry}`);
    console.log(`📝 CHANGELOG.md criado com sucesso.`);
  }

  // 3.5. Sincronizar src/data/versions.js (Notas de Versão / Release Notes no Modal da Aplicação)
  const versionsDataPath = path.join(rootDir, 'src', 'data', 'versions.js');
  if (fs.existsSync(versionsDataPath)) {
    let versionsContent = fs.readFileSync(versionsDataPath, 'utf8');
    if (versionsContent.includes(`"version": "${newVersion}"`)) {
      console.log(`ℹ️ Entrada [${newVersion}] já presente em src/data/versions.js`);
    } else {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const datePt = `${day}/${month}/${year}`;

      // Divide mensagem em tópicos caso contenha separadores ou usa como destaque
      const rawParts = changeMessage.split(/(?:;|\. )+/).map(p => humanizeMessage(p.trim())).filter(Boolean);
      const title = rawParts[0].length > 80 ? rawParts[0].slice(0, 77) + '...' : rawParts[0];
      const highlights = rawParts.length > 0 ? rawParts : [changeMessage];

      const newVersionObject = {
        version: newVersion,
        date: datePt,
        title: title,
        highlights: highlights
      };

      const arrayStart = versionsContent.indexOf('export const SYSTEM_CHANGELOG = [');
      if (arrayStart !== -1) {
        const insertionPoint = arrayStart + 'export const SYSTEM_CHANGELOG = ['.length;
        const formattedEntry = `\n  ${JSON.stringify(newVersionObject, null, 2).replace(/\n/g, '\n  ')},`;
        versionsContent = versionsContent.slice(0, insertionPoint) + formattedEntry + versionsContent.slice(insertionPoint);
        fs.writeFileSync(versionsDataPath, versionsContent);
        console.log(`📜 src/data/versions.js sincronizado com sucesso com a v${newVersion}.`);
      }
    }
  }

  // 4. Compilar aplicação
  console.log(`\n🔨 Compilando aplicação (Vite Build)...`);
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  runCommand(`${npmCmd} run build`);

  // 5. Deploy no Firebase Hosting
  console.log(`\n☁️ Publicando no Firebase Hosting...`);
  runCommand(`${npxCmd} firebase-tools deploy --only hosting --project nexai-nefro`);

  // 6. Commit, Tag e Push no GitHub
  console.log(`\n🐙 Sincronizando com o GitHub...`);
  runCommand('git add .');
  runCommand(`git commit -m "release(v${newVersion}): ${changeMessage}"`);
  runCommand(`git tag v${newVersion}`);
  runCommand('git push origin main --tags');

  console.log('\n=====================================================');
  console.log(`✅ Release v${newVersion} concluída e publicada com sucesso!`);
  console.log(`🌐 Site no ar: https://nexai-nefro.web.app`);
  console.log('=====================================================');
}

main();
