const fs = require('fs')
const path = require('path')
const ora = require('ora')
const chalk = require('chalk')
const execa = require('execa')
const { execSync } = require('child_process')

const cwd = path.resolve(process.cwd(), '../../')
const pkgFile = path.resolve(cwd, './package.json')
const lockFile = path.resolve(cwd, 'yarn.lock')
const isYarn = !!(hasYarn() && fs.existsSync(lockFile))

const spinner = ora('Loading devDependencies...')

async function shell(sh, global = false) {
  let she
  if (isYarn) {
    she = `yarn ${global ? 'global ' : ''}add ${sh}`
  } else {
    she = `npm install ${sh} ${global ? '-g' : ''}`
  }
  console.log('')
  console.log(chalk.red(she))
  return execa.shell(she, { cwd })
}

function hasYarn() {
  try {
    execSync('yarn --version', { stdio: 'ignore' })
    return true
  } catch (error) {
    return false
  }
}

async function install() {
  try {
    spinner.start()
    // commitizen
    await shell('commitizen', true)
    if (isYarn) {
      await execa.shell('commitizen init cz-conventional-changelog --yarn --dev --exact', { cwd })
    } else {
      await execa.shell('commitizen init cz-conventional-changelog -D -E', { cwd })
    }
    spinner.text = 'commitizen installed'
  
    // commitlint
    if (process.platform === 'win32') {
      if (isYarn) {
        await shell('@commitlint/config-conventional @commitlint/cli --dev')
      } else {
        await shell('@commitlint/config-conventional @commitlint/cli -D')
      }
    } else {
      if (isYarn) {
        await shell('@commitlint/{config-conventional,cli} --dev')
      } else {
        await shell('@commitlint/{config-conventional,cli} -D')
      }
    }
    spinner.text = 'commitlint installed'
  
    await execa.shell('echo module.exports = {extends: [\'@commitlint/config-conventional\']} > commitlint.config.js', { cwd })
  
    // lint-staged
    await shell('husky lint-staged -D')

    spinner.succeed(chalk.green('devDependencies installed'))
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

async function writeFile() {
  spinner.text = 'write file...'

  fs.readFile(pkgFile, 'utf8', (err, data) => {
    if (err) {
      console.log(err)
      spinner.fail('failed there has no package.json you should run npm init on the command')
      return
    }

    const pkg = JSON.parse(data)
    pkg.husky = pkg.husky || {}
    Object.assign(pkg.husky, {
      'hooks': {
        'pre-commit': 'lint-staged',
        'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS'
      }
    })

    pkg['lint-staged'] = pkg['lint-staged'] || {}
    pkg['lint-staged']['*.{js,vue}'] = ['eslint --fix', 'git add']

    const newPkg = JSON.stringify(pkg, null, 2)

    fs.writeFile(pkgFile, newPkg, 'utf8', err => {
      if (err) {
        console.error(err)
      }
      spinner.succeed(chalk.green('wrote to package.json'))
    })
  })
}

async function init() {
  if (!fs.existsSync(pkgFile)) {
    console.log('No such package.json File init the package.json')
    execa.shellSync('npm init --yes')
  }
  await install()
  await writeFile()
}

init()