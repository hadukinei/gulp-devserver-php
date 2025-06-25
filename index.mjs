/// <reference path="index.d.ts" />

// Load package
import childProcess from 'node:child_process';
let spawn = childProcess.spawn

import path from 'node:path'
import http from 'node:http'
import open from 'open'
import binaryVersionCheck from 'binary-version-check';
import fs from 'fs-extra'
import chalk from 'chalk'


// Define const value
const Status = {
  'NEW': 0,
  'STARTING': 1,
  'STARTED': 2,
  'FINISHED': 3,
}

const OPTIONS_SPAWN_OBJ = 'spawn'
const OPTIONS_PHP_CLI_ARR = 'php_args'

let conn = {}

conn.OPTIONS_SPAWN_OBJ = OPTIONS_SPAWN_OBJ
conn.OPTIONS_PHP_CLI_ARR = OPTIONS_PHP_CLI_ARR


// Main task

/**
  * Private: Check wherther the server is running.
  * @param hostname
  * @param port
  * @param cb
  */
const checkServer = (hostname, port, cb) => {
  if (conn.status !== Status.STARTING) return

  setTimeout(() => {
    http
    .request(
      {
        method: 'HEAD',
        hostname: hostname,
        port: port
      }, res => {
        const statusCodeType = Number(res.statusCode.toString().charAt(0))

        if ([2, 3, 4].indexOf(statusCodeType) !== -1) {
          return cb(true)
        } else if (statusCodeType === 5) {
          console.log('Server docroot returned 500-level response. Please check ' + 'your configuration for possible errors.')
          return cb(true)
        }

        checkServer(hostname, port, cb)
      }
    ).on('error', _ => {
      // back off after 1s
      if (++conn.checkServerTries > 20) {
        console.log('PHP server not started. Retrying...')
        return cb(false)
      }
      checkServer(hostname, port, cb)
    })
    .end()
  }, 15)
}


/**
  * PHP Development Server Connection Instance
  *
  * {@link http://php.net/manual/en/features.commandline.webserver.php}
  */
const createInstance = opts => {
  conn.status = Status.NEW
  conn.checkServerTries = 0
  conn.workingPort = 8000
  conn.defaults = Object.assign({
    port: 8000,
    hostname: '127.0.0.1',
    base: '.',
    open: false,
    bin: 'php',
    root: '/',
    stdio: 'pipe',
    configCallback: null,
    debug: false
  }, opts || {})
}


/**
  * Close/Shutdown the PHP Development Server
  * @param cb Optional single parameter Callback. Parameter is the return (if any) of the node `ChildProcess.kill(...)` call or nothing if not started.
  */
export const closeServer = cb => {
  if(!cb) cb = () => {}

  if(!!conn.loading) {
    setTimeout(() => {
      return closeServer(cb)
    }, 5)
    return
  }

  if(conn.childProcess) {
    cb(conn.childProcess.kill('SIGKILL'))
    conn.status = Status.FINISHED
    return
  }

  cb()
}


/**
  * Start the Server
  * @param options Optional Server Options to overwrite the defaults in the CTor.
  * @param cb Optional Callback for Completion. May pass in an error when there is a fault.
  */
export const server = async (options, cb) => {
  if(!cb) cb = () => {}
  createInstance(options)

  if(conn.status.NEW && conn.status !== Status.FINISHED) {
    return cb(new Error('You may not start a server that is starting or started.'))
  }

  conn = Object.assign({}, conn.defaults, options)

  const host = `${conn.hostname}:${conn.port}`
  let args = ['-S', host, '-t', conn.base]

  if (!!conn.ini) {
    args.push('-c', conn.ini)
  }

  if (!!conn.router) {
    args.push(path.resolve(conn.router))
  }

  if(conn.debug){
    spawn = function _ba(oSpawn) {
      return function _bb(file, spawnArgs, conn) {
        console.log('Invoking spawn with:')
        console.log('- file: ', file)
        console.log('- args: ', spawnArgs)
        console.log('- conn: ', conn)
        return oSpawn(file, spawnArgs, conn)
      }
    }(spawn)
  }

  if (conn.configCallback === null || conn.configCallback === undefined) {
    conn.configCallback = (_, collection) => collection
  }

  conn.workingPort = conn.port

  spawn = function _ca(oSpawn) {
    return function _cb(file, spawnArgs, spawnOptions) {
      return oSpawn(file, conn.configCallback(OPTIONS_PHP_CLI_ARR, spawnArgs) || spawnArgs, conn.configCallback(OPTIONS_SPAWN_OBJ, spawnOptions) || spawnOptions)
    }
  }(spawn)

  try {
    await binaryVersionCheck(conn.bin, '>=5.4')
  } catch (err) {
    console.log(err)
    cb(err)
    return
  }

  const checkPath = () => {
    if(fs.existsSync(conn.base)) {
      conn.status = Status.STARTING
      conn.childProcess = spawn(conn.bin, args, {
        cwd: '.',
        stdio: conn.stdio,
      })

      conn.childProcess.stdin.end()
      conn.childProcess.stdout.setEncoding('utf8')
      conn.childProcess.stderr.setEncoding('utf8')

      if(conn.debug){
        conn.childProcess.stderr.on('data', chunk => {
          chunk = chunk.replace(/[\r\n]$/, '').replace(/\n/g, "\n ").replace(/^(.*?)\[(.*?)\](.*)$/gm, "$1\t$2\t$3").split("\t")
          chunk = `${chunk[0]}[${chalk.cyan.bold('PHP Log')} ${chalk.cyan(chunk[1])}]${chalk.yellow(chunk[2])}`
          console.log(chunk)
        })
      }

      conn.childProcess.on('exit', () => {
        console.log(` [${chalk.cyan.bold('PHP Log')}] ${chalk.yellow('terminated.')}`)
      })

      conn.childProcess.on('close', () => {
        console.log(` [${chalk.cyan.bold('PHP Log')}] ${chalk.yellow('closed.')}`)
      })
    } else {
      setTimeout(() => {
        checkPath()
      }, 100)
    }
  }
  checkPath()

  // check when the server is ready. tried doing it by listening
  // to the child process `data` event, but it's not triggered...
  checkServer(conn.hostname, conn.port, () => {
    conn.status = Status.STARTED
    if(conn.open){
      open(`http://${conn.hostname}:${conn.port}${conn.root}`)
    }
    cb()
  })
}


/**
  * Get working port number
  */
export const port = () => {
  return conn.workingPort
}
