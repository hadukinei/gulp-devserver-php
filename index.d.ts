// declare module "binary-version-check" because there are no @type/*
declare module "binary-version-check" {
  const binaryVersionCheck = async (
    binary: string,
    semverRange: string,
    options?: object
  ) => null

  export default binaryVersionCheck
}

// declare exports
/**
 * gulp-devserver-php options
 */
interface GulpDevServerPhpOption extends object {
  /**
   * gulp-devserver-php options: port
   * @param {number} port - [Optional] A port number of internal server.
   * @default 8000
   */
  port?: number

  /**
   * gulp-devserver-php options: hostname
   * @param {string} hostname - [Optional] A hostname of internal server.
   * @default "127.0.0.1"
   */
  hostname?: string

  /**
   * gulp-devserver-php options: base
   * @param {string} base - [Optional] A base folder as internal server.
   * @default "."
   */
  base?: string

  /**
   * gulp-devserver-php options: bin
   * @param {string} bin - [Optional] file path to `php.exe`.
   * @default "php"
   * @description If there is sat as "php", works to retrieve a path from environment variable.
   */
  bin?: string

  /**
   * gulp-devserver-php options: ini
   * @param {string | undefined} ini - [Optional] file path to `php.ini`.
   * @description If there are undefined value, works to retrieve a path from environment variable.
   */
  ini?: string | undefined

  /**
   * gulp-devserver-php options: debug
   * @param {boolean} debug - [Optional] Do you want to display a PHP logs in terminal, or not.
   * @default false
   */
  debug?: boolean

  // === undisclosed options

  /**
   * gulp-devserver-php options which inherited from gulp-connect-php: open
   * @param {boolean} open - [Optional] Open the server in browser when task is triggered.
   * @default false
   */
  open?: boolean

  /**
   * gulp-devserver-php options which inherited from gulp-connect-php: router
   * @param {string | undefined} router - [Optional] Describe a path to router-script that is run at each starting HTTP requests.
   */
  router?: string | undefined

  /**
   * gulp-devserver-php options which inherited from gulp-connect-php: stdio
   * @param {string} stdio - [Optional] STDIO parameter of the `Node.js`.
   * @default "pipe"
   */
  stdio?: string | Array<string>

  /**
   * gulp-devserver-php options which inherited from gulp-connect-php: configCallback
   * @param {function (type, collection) | undefined} configCallback - [Optional] STDIO parameter of the `Node.js`.
   * @argument {string} type - OPTIONS_SPAWN_OBJ or OPTIONS_PHP_CLI_ARR
   * @argument {array<any> | object} collection - initial version of the collection specified by `type`
   * @return collection - modified collection
   */
  configCallback?: function
}

/**
 * Open PHP process
 * @param {GulpDevServerPhpOption} options - [Optional] PHP options
 * @param {function} cb - [Optional] Callback function
 */
export declare async function server(options?: GulpDevServerPhpOption, cb?: function): null

/**
 * Close PHP process
 * @param {function} cb - [Optional] Callback function
 */
export declare function closeServer(cb?: function): null

/**
 * Get a current port number of internal server
 * @return {number} Port number
 */
export declare function port(): number
