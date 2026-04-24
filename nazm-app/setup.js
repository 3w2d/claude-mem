#!/usr/bin/env node

const fs = require(‘fs’);
const path = require(‘path’);
const { execSync } = require(‘child_process’);

// Colors for console output
const colors = {
reset: ‘\x1b[0m’,
green: ‘\x1b[32m’,
red: ‘\x1b[31m’,
yellow: ‘\x1b[33m’,
blue: ‘\x1b[34m’,
cyan: ‘\x1b[36m’
};

const log = {
success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
step: (msg) => console.log(`${colors.cyan}🔧 ${msg}${colors.reset}`),
};

const projectRoot = process.cwd();

// Step 1: Create necessary directories
function createDirectories() {
log.step(‘Creating directories…’);
const dirs = [
‘src/components’,
‘src/hooks’,
‘src/lib’,
‘public’,
‘electron’,
‘.github/workflows’
];

dirs.forEach(dir => {
const fullPath = path.join(projectRoot, dir);
if (!fs.existsSync(fullPath)) {
fs.mkdirSync(fullPath, { recursive: true });
log.success(`Created: ${dir}`);
}
});
}

// Step 2: Move files to correct locations
function moveFiles() {
log.step(‘Moving files to correct locations…’);

const fileMoves = [
{ from: ‘HomeDashboard.jsx’, to: ‘src/components/’ },
{ from: ‘AIChat.jsx’, to: ‘src/components/’ },
{ from: ‘ResponsiveLayout.jsx’, to: ‘src/components/’ },
{ from: ‘usePersistence.js’, to: ‘src/hooks/’ },
{ from: ‘useElectron.js’, to: ‘src/hooks/’ },
{ from: ‘api.js’, to: ‘src/lib/’ },
{ from: ‘index.html’, to: ‘public/’ },
{ from: ‘sw.js’, to: ‘src/’ },
{ from: ‘electron-main.js’, to: ‘electron/’ },
{ from: ‘preload.js’, to: ‘electron/’ },
{ from: ‘deploy.yml’, to: ‘.github/workflows/’ },
];

fileMoves.forEach(({ from, to }) => {
const fromPath = path.join(projectRoot, from);
const toPath = path.join(projectRoot, to);

```
if (fs.existsSync(fromPath)) {
  const newFileName = path.join(toPath, from);
  fs.copyFileSync(fromPath, newFileName);
  log.success(`Moved: ${from} → ${to}`);
}
```

});
}

// Step 3: Update NazmFullSystem.jsx to import new components
function updateNazmFullSystem() {
log.step(‘Updating NazmFullSystem.jsx…’);

const nazmPath = path.join(projectRoot, ‘src/NazmFullSystem.jsx’);

if (!fs.existsSync(nazmPath)) {
log.error(‘NazmFullSystem.jsx not found!’);
return;
}

let content = fs.readFileSync(nazmPath, ‘utf-8’);

// Add imports at the top
const importStatements = `import { HomeDashboard } from './components/HomeDashboard'; import { AIChat } from './components/AIChat'; import { ResponsiveLayout, MobileContainer } from './components/ResponsiveLayout'; import { usePersist, useTasks, useChatHistory, useStats } from './hooks/usePersistence'; import { useElectronAPI, useAppInfo } from './hooks/useElectron'; `;

// Check if imports already exist
if (!content.includes(‘import { HomeDashboard }’)) {
content = importStatements + content;
fs.writeFileSync(nazmPath, content, ‘utf-8’);
log.success(‘Updated imports in NazmFullSystem.jsx’);
}

// Replace HomeSection function
if (content.includes(‘function HomeSection({ T, isRtl }) {’)) {
content = content.replace(
/function HomeSection({ T, isRtl }) {[\s\S]*?^}/m,
`function HomeSection({ T, isRtl }) { return <HomeDashboard T={T} isRtl={isRtl} />; }`
);
log.success(‘Updated HomeSection’);
}

// Replace AISection function
if (content.includes(‘function AISection({ T, isRtl }) {’)) {
content = content.replace(
/function AISection({ T, isRtl }) {[\s\S]*?^}/m,
`function AISection({ T, isRtl }) { return <AIChat T={T} isRtl={isRtl} />; }`
);
log.success(‘Updated AISection’);
}

fs.writeFileSync(nazmPath, content, ‘utf-8’);
}

// Step 4: Update package.json
function updatePackageJson() {
log.step(‘Checking package.json…’);

const packagePath = path.join(projectRoot, ‘package.json’);

if (!fs.existsSync(packagePath)) {
log.error(‘package.json not found!’);
return;
}

let pkg = JSON.parse(fs.readFileSync(packagePath, ‘utf-8’));

// Ensure scripts exist
if (!pkg.scripts) pkg.scripts = {};

pkg.scripts[‘dev’] = ‘vite’;
pkg.scripts[‘build’] = ‘vite build’;
pkg.scripts[‘preview’] = ‘vite preview’;
pkg.scripts[‘dev:electron’] = ‘cross-env NODE_ENV=development electron .’;
pkg.scripts[‘dev:all’] = ‘concurrently “npm run dev” “wait-on http://localhost:5173 && npm run dev:electron”’;

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2), ‘utf-8’);
log.success(‘Updated package.json scripts’);
}

// Step 5: Install dependencies
function installDependencies() {
log.step(‘Installing dependencies (this may take a few minutes)…’);

try {
execSync(‘npm install’, {
cwd: projectRoot,
stdio: ‘inherit’
});
log.success(‘Dependencies installed!’);
} catch (error) {
log.error(‘Failed to install dependencies’);
log.warn(‘Try running: npm install –legacy-peer-deps’);
}
}

// Step 6: Summary
function printSummary() {
console.log(`
${colors.cyan}════════════════════════════════════════════════════════${colors.reset}
${colors.green}✨ Setup Complete!${colors.reset}
${colors.cyan}════════════════════════════════════════════════════════${colors.reset}

📁 Project Structure:
✅ src/components/   → HomeDashboard, AIChat, ResponsiveLayout
✅ src/hooks/        → usePersistence, useElectron
✅ src/lib/          → api.js
✅ public/           → index.html
✅ electron/         → electron-main.js, preload.js

🚀 Next Steps:

1️⃣  Start development server:
${colors.yellow}npm run dev${colors.reset}

2️⃣  Open in browser:
${colors.yellow}http://localhost:5173${colors.reset}

3️⃣  Test with Electron (optional):
${colors.yellow}npm run dev:all${colors.reset}

4️⃣  Build for production:
${colors.yellow}npm run build${colors.reset}

5️⃣  Deploy to Vercel (recommended):
${colors.yellow}npm install -g vercel${colors.reset}
${colors.yellow}vercel –prod${colors.reset}

${colors.cyan}════════════════════════════════════════════════════════${colors.reset}
Happy coding! 🎉
${colors.cyan}════════════════════════════════════════════════════════${colors.reset}
`);
}

// Main execution
async function main() {
console.log(`${colors.blue} ╔═══════════════════════════════════════════╗ ║   NAZM Project Setup & Organization      ║ ║   نَظْم · Intelligence Hub                ║ ╚═══════════════════════════════════════════╝ ${colors.reset}`);

log.info(`Project root: ${projectRoot}`);

try {
createDirectories();
moveFiles();
updateNazmFullSystem();
updatePackageJson();
installDependencies();
printSummary();
} catch (error) {
log.error(`Setup failed: ${error.message}`);
process.exit(1);
}
}

main();