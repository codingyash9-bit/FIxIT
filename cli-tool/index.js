#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const { Command } = require('commander');

const program = new Command();

// --- ASCII Neural Link Animation ---
const frames = [
  "   .---.   ",
  "  /     \\  ",
  " |   o   | ",
  "  \\     /  ",
  "   '---'   "
].map(f => chalk.cyan(f));

const sphereFrames = [
  `  ${chalk.blue('◢')} ${chalk.cyan('●')} ${chalk.blue('◣')}  `,
  `  ${chalk.blue('◥')} ${chalk.cyan('●')} ${chalk.blue('◤')}  `,
  `  ${chalk.blue('◢')} ${chalk.cyan('○')} ${chalk.blue('◣')}  `,
  `  ${chalk.blue('◥')} ${chalk.cyan('○')} ${chalk.blue('◤')}  `
];

async function showNeuralLink() {
  console.log(chalk.bold.magenta('\n[ NEURAL LINK INITIALIZED ]'));
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r${sphereFrames[i % sphereFrames.length]} ${chalk.dim('Connecting to Sentinel SRE Layer...')}`);
    i++;
  }, 100);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  clearInterval(interval);
  process.stdout.write('\n\n');
}

// --- Core Logic ---

async function runScript(scriptPath) {
  return new Promise((resolve) => {
    const child = spawn('node', [scriptPath], { stdio: ['inherit', 'inherit', 'pipe'] });
    let stderr = '';

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stderr });
    });
  });
}

async function fixit(scriptPath) {
  const fullPath = path.resolve(process.cwd(), scriptPath);
  
  if (!await fs.exists(fullPath)) {
    console.log(chalk.red(`✖ Error: File ${scriptPath} not found.`));
    process.exit(1);
  }

  await showNeuralLink();

  const spinner = ora(`Executing ${chalk.yellow(scriptPath)}...`).start();
  
  let result = await runScript(fullPath);

  if (result.code === 0) {
    spinner.succeed(chalk.green('Script executed successfully. No bugs detected.'));
    return;
  }

  spinner.fail(chalk.red(`Crash detected in ${scriptPath}!`));
  console.log(chalk.dim('\n--- ERROR LOG ---'));
  console.log(chalk.red(result.stderr));
  console.log(chalk.dim('-----------------\n'));

  const fixSpinner = ora(chalk.magenta('Sentinel AI is analyzing the crash...')).start();

  try {
    const code = await fs.readFile(fullPath, 'utf8');
    
    // Replace with your actual API endpoint
    // For hackathon demo, we'll use a placeholder or the current app's API if available
    const API_URL = process.env.FIXIT_API_URL || 'https://ais-dev-ni2q2q5jmipkmau47qjoch-42350364211.asia-southeast1.run.app/api/fix';
    
    const response = await axios.post(API_URL, {
      code,
      error: result.stderr,
      fileName: scriptPath
    });

    const fixedCode = response.data.fixedCode;

    if (!fixedCode) {
      fixSpinner.fail(chalk.red('AI could not determine a fix.'));
      return;
    }

    fixSpinner.text = chalk.cyan('Applying surgical patch...');
    await fs.writeFile(fullPath, fixedCode);
    fixSpinner.succeed(chalk.green('Patch applied successfully.'));

    const verifySpinner = ora(chalk.blue('Re-running to verify stabilization...')).start();
    let verifyResult = await runScript(fullPath);

    if (verifyResult.code === 0) {
      verifySpinner.succeed(chalk.bold.green('✔ SYSTEM STABILIZED: Fix verified.'));
    } else {
      verifySpinner.fail(chalk.red('Fix failed to stabilize the system. Manual intervention required.'));
      console.log(chalk.red(verifyResult.stderr));
    }

  } catch (error) {
    fixSpinner.fail(chalk.red('Failed to connect to Sentinel AI.'));
    console.error(chalk.dim(error.message));
  }
}

program
  .name('fixit')
  .description('Autonomous AI Debugging Agent')
  .version('1.0.0');

program
  .command('auto')
  .description('Automatically find and fix bugs in a script')
  .argument('<script>', 'path to the script to debug')
  .action((script) => {
    fixit(script);
  });

program.parse();
