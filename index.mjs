// Load package
import childProcess from 'node:child_process';
let spawn = childProcess.spawn

import path from 'node:path'
import http from 'node:http'
import open from 'open'
import binaryVersionCheck from 'binary-version-check';
import fs from 'fs-extra'


// Define const value
const Status = {
  'NEW': 0,
  'STARTING': 1,
  'STARTED': 2,
  'FINISHED': 3,
}

const OPTIONS_SPAWN_OBJ = 'spawn'
const OPTIONS_PHP_CLI_ARR = 'php_args'

const _conn = {}

_conn.OPTIONS_SPAWN_OBJ = OPTIONS_SPAWN_OBJ
_conn.OPTIONS_PHP_CLI_ARR = OPTIONS_PHP_CLI_ARR


// Main task

/**
  * Private: Check wherther the server is running.
  * @param hostname
  * @param port
  * @param cb
  */
const checkServer = (hostname, port, cb) => {
  if ((!!_conn.status) || (_conn.status !== Status.STARTING)) return

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
      if (++_conn.checkServerTries > 20) {
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
  _conn.status = Status.NEW
  _conn.checkServerTries = 0
  _conn.workingPort = 8000
  _conn.defaults = Object.assign({
    port: 8000,
    hostname: '127.0.0.1',
    base: '.',
    open: false,
    bin: 'php',
    root: '/',
    stdio: 'inherit',
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

  if(!!_conn.loading) {
    setTimeout(() => {
      return closeServer(cb)
    }, 5)
    return
  }

  if(_conn.childProcess) {
    cb(_conn.childProcess.kill('SIGKILL'))
    _conn.status = Status.FINISHED
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

  if(_conn.status.NEW && _conn.status !== Status.FINISHED) {
    return cb(new Error('You may not start a server that is starting or started.'))
  }

  _conn = Object.assign({}, _conn.defaults, options)

  const host = `${_conn.hostname}:${_conn.port}`
  let args = ['-S', host, '-t', _conn.base]

  if (!!_conn.ini) {
    args.push('-c', _conn.ini)
  }

  if (!!_conn.router) {
    args.push(path.resolve(_conn.router))
  }

  /*
  if (!!options.debug) {
    spawn = function _debugSpawn(outerSpawn) {
      return function debugSpawnWrapper(file, args, options) {
        console.log('Invoking Spawn with:')
        console.log(file)
        console.log(args)
        console.log(options)

        return outerSpawn(file, args, options)
      }
    }(spawn)
  }
  */

  if (_conn.configCallback === null || _conn.configCallback === undefined) {
    _conn.configCallback = (type, collection) => collection
  }

  _conn.workingPort = _conn.port
  console.log(1, _conn)

  spawn = function _ca(oSpawn) {
    return function _cb(file, spawnArgs, spawnOptions) {
      return oSpawn(file, _conn.configCallback(OPTIONS_PHP_CLI_ARR, spawnArgs) || spawnArgs, _conn.configCallback(OPTIONS_SPAWN_OBJ, spawnOptions) || spawnOptions)
    }
  }(spawn)

  try {
    await binaryVersionCheck(_conn.bin, '>=5.4')
  } catch (err) {
    console.log(err)
    cb(err)
    return
  }

  const checkPath = () => {
    if(fs.existsSync(_conn.base)) {
      _conn.status = Status.STARTING
      _conn.childProcess = spawn(_conn.bin, args, {
        cwd: '.',
        stdio: _conn.stdio,
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
  checkServer(_conn.hostname, _conn.port, () => {
    _conn.status = Status.STARTED
    if(_conn.open) {
      open(`http://${host}${_conn.root}`)
    }
    cb()
  })
}


/**
  * Get working port number
  */
export const port = () => {
  return _conn.workingPort
}
