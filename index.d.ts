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
 * Open PHP process
 * @param {object} options - [Optional] PHP options
 * @param {function} cb - [Optional] Callback function
 */
export declare async function server(options?: object, cb?: function): null

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
