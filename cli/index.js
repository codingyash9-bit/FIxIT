#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const { program } = require('commander');

program
  .version('1.0.0')
  .description('Fixit CLI: Autonomous AI Debugging Agent');

program
  .command('auto <file>')
  .description('Run a script and automatically fix any crashes')
  .action(async (file) => {
    const filePath = path.resolve(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.log(chalk.red(`Error: File ${file} not found.`));
      process.exit(1);
    }

    await runAutonomousLoop(filePath);
  });

async function runAutonomousLoop(filePath) {
  const spinner = ora(`Running ${path.basename(filePath)}...`).start();
  
  const runScript = () => {
    return new Promise((resolve) => {
      const child = spawn('node', [filePath]);
      let stderr = '';

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ code, stderr });
      });
    });
  };

  const result = await runScript();

  if (result.code === 0) {
    spinner.succeed(chalk.green('Script executed successfully!'));
    return;
  }

  spinner.fail(chalk.red('Script crashed!'));
  console.log(chalk.yellow('\n--- Error Log ---'));
  console.log(chalk.dim(result.stderr));
  console.log(chalk.yellow('-----------------\n'));

  const analysisSpinner = ora('Analyzing crash with FixIT AI...').start();
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Replace with your actual API endpoint
    const response = await axios.post('https://ais-dev-ni2q2q5jmipkmau47qjoch-42350364211.asia-southeast1.run.app/api/fix', {
      code: fileContent,
      error: result.stderr
    });

    const fixedCode = response.data.fixedCode;
    
    if (!fixedCode) {
      analysisSpinner.fail(chalk.red('AI could not determine a fix.'));
      return;
    }

    analysisSpinner.succeed(chalk.green('Fix identified!'));
    
    const fixSpinner = ora('Applying surgical patch...').start();
    fs.writeFileSync(filePath, fixedCode);
    fixSpinner.succeed(chalk.green('File updated.'));

    console.log(chalk.cyan('\nRe-running to verify fix...\n'));
    await runAutonomousLoop(filePath);

  } catch (error) {
    analysisSpinner.fail(chalk.red(`AI Analysis failed: ${error.message}`));
  }
}

program.parse(process.argv);
