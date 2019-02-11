const execa = require('execa')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const rootpath = path.resolve(process.cwd(), '../../')

async function shell(sh) {
  return execa.shell(sh, {cwd: rootpath})
}

async function install() {
  // commitizen
  await shell('npm install -g commitizen')
  await shell('commitizen init cz-conventional-changelog --save-dev --save-exact')

  // commitlint
  await shell('npm install --save-dev @commitlint/config-conventional @commitlint/cli')
  await shell('echo module.exports = {extends: [\'@commitlint/config-conventional\']} > commitlint.config.js')

  // lint-staged
  await shell('npm install husky lint-staged -D')

  console.log(`${chalk.bgMagenta.white.bold('devDependencies has installed')}`)

  writeFile()
}

function writeFile() {
  const pkgpath = path.resolve(rootpath, './package.json')
  fs.readFile(pkgpath, 'utf8', (err, data) => {
    if (err) {
      console.log(err)
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

    pkg['lint-staged'] = {'*.{js,vue}': ['eslint --fix', 'git add']}

    const newPkg = JSON.stringify(pkg, null, 2)

    fs.writeFile(pkgpath, newPkg, 'utf8', err => {
      if (err) {
        console.error(err)
      }
      console.log('')
      console.log(`${chalk.green('package.json was rewrited')}`)
    })
  })
}

install()