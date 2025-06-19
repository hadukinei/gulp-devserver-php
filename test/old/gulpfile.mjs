/**
 * Load package
 */
import { series, src, dest } from './node_modules/gulp/index.mjs'
import fs from 'fs-extra'
import { glob } from 'glob'
import ts from 'typescript'
import browserSync from 'browser-sync'

//import gulpConnectPhp from 'gulp-connect-php'
//import * as gulpConnectPhp from '../gulp-connect-php/index.js'
import * as gulpConnectPhp from '../../../../Users/user/Desktop/%E4%BA%95%E4%B8%8A%E6%B7%B3/gulp-connect-php/index.js'

/**
 * Task
 */

// delete
const task_delete = async done => {
  let promises = []
  let files = await glob('./dist/**/*', {ignore: 'node_modules/**'})

  files.forEach(file => {
    promises.push(new Promise((resolve, reject) => {
      fs.remove(file)
      .then(() => {
        resolve()
      })
      .catch(e => {
        reject(e.message)
      })
    }))
  })

  Promise.allSettled(promises)
  .finally(() => {
    done()
  })
}

// html
const task_php = done => {
  src('./src/**/*.(php|html)', {
    allowEmpty: true,
  })
  .pipe(dest('./dist'))

  done()
}

// javascript
const task_js = async done => {
  let promises = []
  let files = await glob('./src/**/*.ts', {ignore: 'node_modules/**'})

  const tsOption = {
    target: 'es6',
    module: 'commonjs',
    explainFiles: true,
    noImplicitAny: false,
    exclude: ['node_modules'],
  }

  files.forEach(file => {
    promises.push(new Promise(resolve => {
      const cBuffer = fs.readFileSync(file)
      const cText = Buffer.from(cBuffer).toString("utf8").replace(/^import\s.*?$/gm, '')
      const tText = ts.transpile(cText, tsOption)
      const oUrl = file.replace(/^src\\/, 'dist\\').replace(/\.ts$/, '.js')
      fs.writeFileSync(oUrl, tText)
      resolve()
    }))
  })

  Promise.allSettled(promises)
  .finally(() => {
    done()
  })
}

// server
const isPHP = true
const task_server = done => {
  if(!isPHP){
    browserSync.init({
      server: {
        baseDir: './dist',
      },
    })
  }else{
    let options = {
      base: 'dist',
      port: 8880,

      bin: 'C:/wamp64/bin/php/php8.3.14/php.exe',
      ini: 'C:/wamp64/bin/php/php8.3.14/php.ini',
    }
    /*
    if(phpIni !== ''){
      options.ini = phpIni
    }
    if(phpBin !== ''){
      options.bin = phpBin;
    }
    */

    gulpConnectPhp.server(
      options,
      () => {
        browserSync.init({
          proxy: 'localhost:8880',
        }
      )
    })
  }

  done()
}

/**
 * Export
 */
export const runnerDelete = series(
  task_delete,
)

export const runnerDev = series(
  task_js,
  task_php,
  task_server,
)

export default series(
  task_js,
  task_php,
)
