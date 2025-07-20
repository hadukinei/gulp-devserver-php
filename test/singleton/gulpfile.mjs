/**
 * load packages
 */

// Stream
import { series } from 'gulp'

// Live server
//import { server as phpServer, closeServer } from '../../index.mjs'
import { server as phpServer, closeServer } from 'gulp-devserver-php'


/**
 * Tasks
 */

// Serve PHP
const task_serve = done => {
  phpServer({
    //debug: true,
    bin: "D:/php-8.4.10/php.exe",
    ini: "D:/php-8.4.10/php.ini",
  }, () => {
    closeServer()
  })

  done()
}


/**
 * Exports
 */

// npm run serve
export default series(
  task_serve,
)
