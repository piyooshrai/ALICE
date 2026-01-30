#!/usr/bin/env node

/**
 * ALICE SDK Configuration Management
 * Manages API keys and server settings
 */

const Conf = require('conf')
const inquirer = require('inquirer')
const chalk = require('chalk')

const config = new Conf({
  projectName: 'alice-sdk',
})

/**
 * Get API key from config
 */
function getApiKey() {
  return config.get('apiKey')
}

/**
 * Set API key in config
 */
function setApiKey(apiKey) {
  config.set('apiKey', apiKey)
}

/**
 * Get server URL
 */
function getServerUrl() {
  return config.get('serverUrl', 'https://alice-server.vercel.app')
}

/**
 * Set server URL
 */
function setServerUrl(url) {
  config.set('serverUrl', url)
}

/**
 * Get developer info
 */
function getDeveloperInfo() {
  return {
    name: config.get('developerName'),
    email: config.get('developerEmail'),
  }
}

/**
 * Set developer info
 */
function setDeveloperInfo(name, email) {
  config.set('developerName', name)
  config.set('developerEmail', email)
}

/**
 * Interactive configuration setup
 */
async function setupConfig() {
  console.log(chalk.bold.cyan('\nALICE SDK Configuration\n'))

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your ALICE API key:',
      validate: (input) => {
        if (!input || !input.startsWith('alice_')) {
          return 'Please enter a valid ALICE API key (starts with alice_)'
        }
        return true
      },
    },
    {
      type: 'input',
      name: 'serverUrl',
      message: 'Server URL:',
      default: 'https://alice-server.vercel.app',
    },
    {
      type: 'input',
      name: 'developerName',
      message: 'Your name:',
      validate: (input) => input.length > 0 || 'Name is required',
    },
    {
      type: 'input',
      name: 'developerEmail',
      message: 'Your email:',
      validate: (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(input) || 'Please enter a valid email'
      },
    },
  ])

  setApiKey(answers.apiKey)
  setServerUrl(answers.serverUrl)
  setDeveloperInfo(answers.developerName, answers.developerEmail)

  console.log(chalk.green('\n✓ Configuration saved successfully!\n'))

  return answers
}

/**
 * Check if configured
 */
function isConfigured() {
  return !!getApiKey()
}

/**
 * Display current configuration
 */
function showConfig() {
  console.log(chalk.bold.cyan('\nCurrent Configuration:\n'))

  const apiKey = getApiKey()
  const serverUrl = getServerUrl()
  const { name, email } = getDeveloperInfo()

  console.log(`${chalk.bold('Server URL:')} ${serverUrl}`)
  console.log(`${chalk.bold('API Key:')} ${apiKey ? apiKey.substring(0, 15) + '...' : 'Not set'}`)
  console.log(`${chalk.bold('Developer:')} ${name || 'Not set'}`)
  console.log(`${chalk.bold('Email:')} ${email || 'Not set'}`)
  console.log()
}

module.exports = {
  getApiKey,
  setApiKey,
  getServerUrl,
  setServerUrl,
  getDeveloperInfo,
  setDeveloperInfo,
  setupConfig,
  isConfigured,
  showConfig,
}
