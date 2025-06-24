// declare module "binary-version-check" because there are no @type/*
declare module "binary-version-check" {
  const binaryVersionCheck = async (
    binary: string,
    semverRange: string,
    options?: object
  ) => null

  export default binaryVersionCheck
}
