module.exports = (api) => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['babel-plugin-tsconfig-paths', 'nativewind/babel', 'babel-plugin-transform-import-meta'],
  };
};
