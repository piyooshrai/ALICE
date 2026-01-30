/**
 * ALICE SDK Upload Module
 * Uploads code to ALICE server for analysis
 */

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const axios = require('axios')
const FormData = require('form-data')
const chalk = require('chalk')
const ora = require('ora')
const { getApiKey, getServerUrl, getDeveloperInfo } = require('./config')

/**
 * Create archive of code directory
 */
async function createArchive(sourcePath, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', {
      zlib: { level: 9 },
    })

    output.on('close', () => resolve(outputPath))
    archive.on('error', (err) => reject(err))

    archive.pipe(output)

    // Add files, excluding certain directories
    const excludeDirs = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'venv',
      '__pycache__',
      '.vercel',
      'coverage',
    ]

    archive.glob('**/*', {
      cwd: sourcePath,
      ignore: excludeDirs.map(dir => `**/${dir}/**`),
      dot: true,
    })

    archive.finalize()
  })
}

/**
 * Upload archive to ALICE server
 */
async function uploadToServer(archivePath) {
  const apiKey = getApiKey()
  const serverUrl = getServerUrl()
  const { name, email } = getDeveloperInfo()

  if (!apiKey) {
    throw new Error('API key not configured. Run: alice init')
  }

  const formData = new FormData()
  formData.append('archive', fs.createReadStream(archivePath))
  formData.append('developer_email', email)
  formData.append('developer_name', name)

  const response = await axios.post(`${serverUrl}/api/analyze`, formData, {
    headers: {
      'X-API-Key': apiKey,
      ...formData.getHeaders(),
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  })

  return response.data
}

/**
 * Analyze code directory
 */
async function analyzeCode(sourcePath = '.') {
  const spinner = ora('Preparing code for analysis...').start()

  try {
    // Create temporary archive
    const tempDir = fs.mkdtempSync('/tmp/alice-')
    const archivePath = path.join(tempDir, 'code.zip')

    spinner.text = 'Creating archive...'
    await createArchive(path.resolve(sourcePath), archivePath)

    spinner.text = 'Uploading to ALICE server...'
    const result = await uploadToServer(archivePath)

    // Cleanup
    fs.unlinkSync(archivePath)
    fs.rmdirSync(tempDir)

    spinner.succeed('Analysis complete!')

    return result

  } catch (error) {
    spinner.fail('Analysis failed')
    throw error
  }
}

/**
 * Display analysis results
 */
function displayResults(results) {
  console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════\n'))
  console.log(chalk.bold.white('  ALICE Analysis Results\n'))
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'))

  // Quality Score
  const scoreColor = results.quality_score >= 75 ? chalk.green :
                     results.quality_score >= 60 ? chalk.yellow :
                     chalk.red

  console.log(`${chalk.bold('Quality Score:')} ${scoreColor(results.quality_score + '%')}`)

  // Deployment Status
  const statusColor = results.deployment_status === 'APPROVED' ? chalk.green :
                      results.deployment_status === 'CAUTION' ? chalk.yellow :
                      chalk.red

  console.log(`${chalk.bold('Deployment Status:')} ${statusColor(results.deployment_status)}`)

  if (results.deployment_status === 'BLOCKED') {
    console.log(chalk.red.bold('\n⚠️  DEPLOYMENT BLOCKED ⚠️'))
    console.log(chalk.red('Critical issues must be resolved before production deployment.\n'))
  }

  // Summary
  console.log(chalk.bold('\nSummary:'))
  console.log(`  Files Analyzed: ${results.total_files}`)
  console.log(`  Critical Issues: ${chalk.red(results.issues.critical)}`)
  console.log(`  High Priority: ${chalk.yellow(results.issues.high)}`)
  console.log(`  Medium Priority: ${results.issues.medium}`)
  console.log(`  Low Priority: ${results.issues.low}`)

  // Bugs
  if (results.bugs && results.bugs.length > 0) {
    console.log(chalk.bold('\nIssues Found:\n'))

    const criticalBugs = results.bugs.filter(b => b.severity === 'CRITICAL')
    const highBugs = results.bugs.filter(b => b.severity === 'HIGH')

    // Show critical and high bugs
    const importantBugs = [...criticalBugs, ...highBugs].slice(0, 10)

    importantBugs.forEach((bug, index) => {
      const severityColor = bug.severity === 'CRITICAL' ? chalk.red :
                           bug.severity === 'HIGH' ? chalk.yellow :
                           chalk.blue

      console.log(`${index + 1}. ${severityColor(`[${bug.severity}]`)} ${chalk.bold(bug.category)}`)
      console.log(`   ${chalk.dim('Location:')} ${bug.file_path}:${bug.line_number}`)
      console.log(`   ${chalk.dim('Description:')} ${bug.description}`)

      if (bug.fix_suggestion) {
        console.log(`   ${chalk.dim('Fix:')} ${bug.fix_suggestion}`)
      }

      console.log()
    })

    if (results.bugs.length > 10) {
      console.log(chalk.dim(`... and ${results.bugs.length - 10} more issues\n`))
    }
  } else {
    console.log(chalk.green('\n✓ No critical issues found!\n'))
  }

  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'))
  console.log(chalk.dim('Analysis ID: ' + results.analysis_id))
  console.log(chalk.dim('Technical report sent to your email.\n'))
}

module.exports = {
  analyzeCode,
  displayResults,
}
