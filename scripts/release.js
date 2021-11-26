const ncp = require('ncp')
const path = require('path')
const fs = require('fs')
const argv = require('argv')
const _ = require('lodash')

const args = argv.option([
  {
    name: 'version',
    short: 'v',
    type: 'string'
  },
]).run()

const version = args.options.version

const outputDir = path.resolve(__dirname, '../../vueform-releases', version)

const files = {
  'dist': 'dist',
  'themes': 'themes',
  'locales': 'locales',
  'LICENSE.txt': 'LICENSE.txt',
  'README.md': 'README.md',
}

const copyPackageJson = function() {
  let packageJson = fs.readFileSync(path.resolve(__dirname, '../', 'dist.package.json'), 'UTF-8')

  packageJson = packageJson.replace(/"\d\.\d\.\d"/, `"${version}"`)

  fs.writeFileSync(path.resolve(outputDir, 'package.json'), packageJson)
}

if (!fs.existsSync(outputDir)){
  fs.mkdirSync(outputDir, { recursive: true });
}

_.each(files, (to, from) => {
  ncp(path.resolve(__dirname, '../', from), path.resolve(outputDir, to), function (err) {
    if (err) {
      return console.error(err);
    }
  })
})

copyPackageJson()