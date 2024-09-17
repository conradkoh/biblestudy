/// <reference types="nativewind/types" />

// any json file import
declare module "*.json" {
  const value: any;
  export default value;
}
