/// <reference types="nativewind/types" />

// any json file import
declare module "*.json" {
  const value: any;
  export default value;
}

// any onnx file import
declare module "*.onnx" {
  const value: any;
  export default value;
}
