/**
 * load packages
 */

// Stream
import { watch, series, src, dest } from 'gulp'
import plumber from 'gulp-plumber'
import gulpIf from 'gulp-if'
import rename from 'gulp-rename'

import fs from 'fs-extra'

// Pug
import pug from 'gulp-pug'

// Live server
import browserSync from 'browser-sync'
import { server as phpServer } from '../../index.mjs'
//import { server as phpServer } from 'gulp-devserver-php'


/**
 * Variables
 */

const isPHP = true


/**
 * Tasks
 */

// clean
const task_clean = done => {
  if(fs.existsSync('dist')){
    fs.rmSync('dist', {recursive: true})
  }

  done()
}


// HTML <= Pug
const task_html = done => {
  src('src/**/!(_)*.pug', {
    allowEmpty: true,
  })
  .pipe(plumber())
  .pipe(pug({
    locals: {
      isPHP: isPHP
    },
    filters: {
      "php": text => {
        if(isPHP){
          text = "<!-- htmlmin:ignore --><?php\r\n" + text + "\r\n?><!-- htmlmin:ignore -->"
        }else{
          text = "<!-- [PHP] \r\n" + text + "\r\n [/PHP] -->"
        }
        return text
      }
    },
  }))
  .pipe(gulpIf(isPHP, rename({
    extname: '.php',
  })))
  .pipe(dest('dist'))

  done()
}


// Watch
const task_watch = done => {
  watch('./src/**/*.pug', series(task_html, task_reload))
  done()
}


// Server
const task_server = done => {
  if(isPHP){
    let options = {
      base: 'dist',

      // Changing PHP version, set path to .exe and .ini directly
      //bin: "C:/php7.4.13/php.exe",
      //ini: "C:/php7.4.13/php.ini",

      // When using WAMP, does not registered PHP path in Environmental values
      // And also using in Mac too
      // Set path to .exe and .ini directly
      //bin: 'C:/wamp64/bin/php/php8.3.14/php.exe',
      //ini: 'C:/wamp64/bin/php/php8.3.14/php.ini',
    }

    phpServer(
      options,
      () => {
        browserSync.init({
          proxy: 'localhost:8000',
        })
      },
    )
  }else{
    browserSync.init({
      server: {
        baseDir: './dist',
      },
    })
  }

  done()
}

const task_reload = done => {
  browserSync.reload()
  done()
}


/**
 * Exports
 */

// npm run build
export default series(
  task_html,
)

// npm run dev
export const dev = series(
  task_html,
  task_server,
  task_watch,
)

// npm run clean
export const clean = series(
  task_clean,
)
