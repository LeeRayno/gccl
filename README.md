# gccl [![Build status](https://travis-ci.com/LeeRayno/gccl.svg?branch=master)](https://travis-ci.com/LeeRayno/gccl)

git commitizen &amp; commitlint &amp; lint-staged

## Getting started

```sh
npm i gccl -D

# OR
yarn add gccl -D
```

## Two things have been done

1. It just install these devDependencies [commitizen](https://github.com/commitizen/cz-cli)、 [commitlint](https://github.com/conventional-changelog/commitlint)、 [lint-staged](https://github.com/okonet/lint-staged) in your project
2. add the info in your package.json and create a `commitlint.config.js` in your project
   ```json
   {
     ...
     "config": {
       "commitizen": {
         "path": "./node_modules/cz-conventional-changelog"
       }
     },
     "husky": {
       "hooks": {
         "pre-commit": "lint-staged",
         "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
       }
     },
     "lint-staged": {
      "*.{js,vue}": [
        "eslint --fix",
        "git add"
      ]
     }
   }
   ```
