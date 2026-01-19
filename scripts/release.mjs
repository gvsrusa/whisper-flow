import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Readline removed as part of automation
// import readline from 'readline';

const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');
const TAURI_CONF_PATH = path.join(__dirname, '../src-tauri/tauri.conf.json');

// function askQuestion(query) { ... } removed


function runCommand(command) {
  try {
    console.log(`> ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Release Automation...');

  // 1. Read Current Version
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  const tauriConf = JSON.parse(fs.readFileSync(TAURI_CONF_PATH, 'utf8'));
  const currentVersion = packageJson.version;

  console.log(`\nCurrent Version: ${currentVersion}`);
  
  // Default to patch
  let bumpType = 'patch';
  const args = process.argv.slice(2);
  
  if (args.includes('minor')) bumpType = 'minor';
  else if (args.includes('major')) bumpType = 'major';
  else if (args.includes('patch')) bumpType = 'patch';

  console.log(`Auto-selecting release type: ${bumpType.toUpperCase()}`);

  let newVersion = '';
  const [majorNum, minorNum, patchNum] = currentVersion.split('.').map(Number); // Renamed to avoid shadowing

  switch (bumpType) {
    case 'patch':
      newVersion = `${majorNum}.${minorNum}.${patchNum + 1}`;
      break;
    case 'minor':
      newVersion = `${majorNum}.${minorNum + 1}.0`;
      break;
    case 'major':
      newVersion = `${majorNum + 1}.0.0`;
      break;
  }

  if (!newVersion) {
    console.log('Invalid version. Aborting.');
    process.exit(1);
  }

  console.log(`\nPreparing release: v${newVersion}`);

  // 2. Update Files
  packageJson.version = newVersion;
  tauriConf.version = newVersion;

  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
  fs.writeFileSync(TAURI_CONF_PATH, JSON.stringify(tauriConf, null, 2) + '\n');
  console.log('✅ Updated package.json and tauri.conf.json');

  // 3. Git Operations
  const branchName = `release/v${newVersion}`;
  const commitMsg = `chore: release v${newVersion}`;

  console.log('\nPerforming Git operations...');
  
  if (!runCommand(`git checkout -b ${branchName}`)) {
    console.log('Failed to create branch. You might already be on it or it exists.');
  }
  
  runCommand('git add package.json src-tauri/tauri.conf.json');
  runCommand(`git commit -m "${commitMsg}"`);

  console.log('\n🎉 Release Branch Ready!');
  console.log('---------------------------------------------------');
  console.log(`1. Review your changes.`);
  console.log(`2. Push the branch: git push origin ${branchName}`);
  console.log(`3. Create a Pull Request to master.`);
  console.log(`4. Once merged, create a tag: git tag v${newVersion}`);
  console.log(`5. Push the tag: git push origin v${newVersion}`);
  console.log('---------------------------------------------------');
  console.log('This will trigger the GitHub Action to build the DMG.');


}

main();
