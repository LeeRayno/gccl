const execa = require('execa')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const pkgpath = path.resolve(process.cwd(), '../../', './package.json')

async function install() {
  // commitizen
  await execa.shell('npm install -g commitizen', {cwd: pkgpath})
  await execa.shell('commitizen init cz-conventional-changelog -D --save-exact', {cwd: pkgpath})

  // commitlint
  await execa.shell('npm install --save-dev @commitlint/config-conventional @commitlint/cli', {cwd: pkgpath})
  execa.shellSync('echo module.exports = {extends: [\'@commitlint/config-conventional\']} > commitlint.config.js', {cwd: pkgpath})

  // lint-staged
  await execa.shell('npm install husky lint-staged -D')

  console.log(`${chalk.bgMagenta.white.bold('devDependencies has installed')}`)

  writeFile()
}

function writeFile() {
  fs.readFile(pkgpath, 'utf8', (err, data) => {
    if (err) {
      console.log(err)
      return
    }

    const pkg = JSON.parse(data)

    pkg.husky.hooks['pre-commit'] = 'lint-staged'
    pkg.husky.hooks['commit-msg'] = 'commitlint -E HUSKY_GIT_PARAMS'

    pkg['lint-staged'] = {'*.{js,vue}': ['eslint --fix', 'git add']}

    const newPkg = JSON.stringify(pkg, null, 2)

    fs.writeFile(pkgpath, newPkg, 'utf8', err => {
      if (err) {
        console.error(err)
      }
      console.log('')
      console.log(`${chalk.green('package.json war rewrited')}`)
    })
  })
}

install()