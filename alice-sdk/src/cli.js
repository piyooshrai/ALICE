#!/usr/bin/env node

/**
 * ALICE SDK CLI
 * Command-line interface for ALICE code analysis
 */

const { Command } = require('commander')
const chalk = require('chalk')
const package = require('../package.json')
const config = require('./config')
const { analyzeCode, displayResults } = require('./upload')

const program = new Command()

// CLI Header
console.log(chalk.bold.cyan('\nALICE - Automated Logic Inspection & Code Evaluation\n'))

program
  .name('alice')
  .description('ALICE SDK - Automated code quality analysis')
  .version(package.version)

// Init command
program
  .command('init')
  .description('Initialize ALICE SDK configuration')
  .action(async () => {
    try {
      await config.setupConfig()
    } catch (error) {
      console.error(chalk.red('Error during initialization:', error.message))
      process.exit(1)
    }
  })

// Analyze command
program
  .command('analyze [path]')
  .description('Analyze code in the specified directory (default: current directory)')
  .option('-s, --silent', 'Suppress detailed output')
  .action(async (path = '.', options) => {
    try {
      // Check if configured
      if (!config.isConfigured()) {
        console.log(chalk.yellow('⚠️  ALICE SDK not configured.'))
        console.log(chalk.dim('Run: alice init\n'))
        process.exit(1)
      }

      // Run analysis
      const results = await analyzeCode(path)

      // Display results
      if (!options.silent) {
        displayResults(results)
      }

      // Exit with error code if deployment blocked
      if (results.deployment_status === 'BLOCKED') {
        process.exit(1)
      }

    } catch (error) {
      console.error(chalk.red('\nError during analysis:'), error.message)

      if (error.response) {
        console.error(chalk.red('Server response:'), error.response.data)
      }

      process.exit(1)
    }
  })

// Status command
program
  .command('status')
  .description('Show current ALICE SDK configuration')
  .action(() => {
    if (!config.isConfigured()) {
      console.log(chalk.yellow('⚠️  ALICE SDK not configured.'))
      console.log(chalk.dim('Run: alice init\n'))
      process.exit(1)
    }

    config.showConfig()
  })

// Config command
program
  .command('config')
  .description('Manage ALICE SDK configuration')
  .option('--set-key <apiKey>', 'Set API key')
  .option('--set-server <url>', 'Set server URL')
  .option('--show', 'Show current configuration')
  .action((options) => {
    if (options.setKey) {
      config.setApiKey(options.setKey)
      console.log(chalk.green('✓ API key updated'))
    }

    if (options.setServer) {
      config.setServerUrl(options.setServer)
      console.log(chalk.green('✓ Server URL updated'))
    }

    if (options.show || (!options.setKey && !options.setServer)) {
      config.showConfig()
    }
  })

// Help text customization
program.on('--help', () => {
  console.log('')
  console.log('Examples:')
  console.log('  $ alice init                     Initialize SDK')
  console.log('  $ alice analyze                  Analyze current directory')
  console.log('  $ alice analyze ./my-project     Analyze specific directory')
  console.log('  $ alice status                   Show configuration')
  console.log('')
  console.log('Git Hook Integration:')
  console.log('  Add to .git/hooks/pre-commit:')
  console.log('  #!/bin/sh')
  console.log('  alice analyze --silent || exit 1')
  console.log('')
})

// Parse arguments
program.parse(process.argv)

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
