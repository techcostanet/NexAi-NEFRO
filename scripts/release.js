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

  const changeMessage = filteredArgs.join(' ') || 'Melhorias gerais e correções no sistema';

  console.log('=====================================================');
  console.log('🚀 NexAi-NEFRO - Pipeline Automático de Release');
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
    const headerEnd = existing.indexOf('\n## [');
    if (headerEnd !== -1) {
      const updated = existing.slice(0, headerEnd) + newEntry + existing.slice(headerEnd);
      fs.writeFileSync(changelogPath, updated);
    } else {
      fs.appendFileSync(changelogPath, newEntry);
    }
  } else {
    fs.writeFileSync(changelogPath, `# Registro de Mudanças (Changelog) - NexAi-NEFRO\n${newEntry}`);
  }
  console.log(`📝 CHANGELOG.md atualizado com sucesso.`);

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
