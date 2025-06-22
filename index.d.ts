// put in as sibling with gulp-devserver-php/index.mjs
/*
declare module "binary-version-check" {
  export default async function binaryVersionCheck(binary: string, semverRange: string, options?: object): null
}
*/

// put in as sibling with gulp-devserver-php/index.mjs
declare module "binary-version-check" {
  const binaryVersionCheck = async (
    binary: string,
    semverRange: string,
    options?: object
  ) => null

  export default binaryVersionCheck
}
