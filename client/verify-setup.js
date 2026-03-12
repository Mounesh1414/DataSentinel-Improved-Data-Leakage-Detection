#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 DataSentinel Client Setup Verification\n');

// Check critical files
const checks = [
  { name: 'public/index.html', path: './public/index.html' },
  { name: 'src/main.jsx', path: './src/main.jsx' },
  { name: 'src/App.jsx', path: './src/App.jsx' },
  { name: 'vite.config.js', path: './vite.config.js' },
  { name: 'package.json', path: './package.json' },
];

const cwd = process.cwd();
let allGood = true;

checks.forEach(check => {
  const fullPath = path.join(cwd, check.path);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${check.name}`);
  if (!exists) allGood = false;
});

console.log('\n📦 Node modules status:');
const nodeModulesExists = fs.existsSync(path.join(cwd, 'node_modules'));
console.log(`${nodeModulesExists ? '✅' : '⚠️'} node_modules exists`);

if (!nodeModulesExists) {
  console.log('\n⚠️  node_modules not found. Run: npm install');
  allGood = false;
}

console.log('\n' + (allGood ? '✅ Setup looks good!\n' : '❌ Issues found.\n'));
console.log('To start development:');
console.log('  npm run dev');
console.log('\nThen open: http://127.0.0.1:3000');
