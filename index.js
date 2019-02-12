const fs = require('fs')
const os = require('os')
const ora = require('ora')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')

const rootpath = path.resolve(process.cwd(), '../../')

const spinner = ora('Loading devDependencies...')

async function shell(sh) {
  return execa.shell(sh, {cwd: rootpath})
}

async function install() {
  spinner.start()
  // commitizen
  await shell('npm install -g commitizen')
  await shell('commitizen init cz-conventional-changelog --save-dev --save-exact')
  spinner.text = 'commitizen installed'

  // commitlint
  if (os.type() === 'Windows_NT') {
    await shell('npm install --save-dev @commitlint/config-conventional @commitlint/cli')
  } else {
    await shell('npm install --save-dev @commitlint/{config-conventional,cli}')
  }
  spinner.text = 'commitlint installed'

  await shell('echo module.exports = {extends: [\'@commitlint/config-conventional\']} > commitlint.config.js')

  // lint-staged
  await shell('npm install husky lint-staged -D')
  spinner.succeed(chalk.green('devDependencies installed'))
}

async function writeFile() {
  spinner.text = 'write file...'
  const pkgpath = path.resolve(rootpath, './package.json')
  fs.readFile(pkgpath, 'utf8', (err, data) => {
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

    fs.writeFile(pkgpath, newPkg, 'utf8', err => {
      if (err) {
        console.error(err)
      }
      spinner.succeed(chalk.green('wrote to package.json'))
    })
  })
}

async function init() {
  await install()
  await writeFile()
}

init()