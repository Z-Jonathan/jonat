module.exports = function (api) {
  api.cache(true);

  // NativeWind v4's `nativewind/babel` preset delegates to
  // `react-native-css-interop/babel`, which (in the 0.2.4 version pinned by
  // nativewind@4.2.4) hardcodes `react-native-worklets/plugin`. That plugin
  // only ships with reanimated 4 (Expo SDK 53+). This project is on Expo SDK
  // 52 + reanimated 3, which uses `react-native-reanimated/plugin` instead, so
  // we replicate the preset's plugins minus the worklets entry and add the
  // correct reanimated plugin ourselves. Revisit when upgrading the SDK.
  const cssInteropPlugins = require('react-native-css-interop/babel')()
    .plugins.filter(
      (plugin) =>
        !(
          typeof plugin === 'string' &&
          plugin.includes('react-native-worklets')
        ),
    );

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    // react-native-reanimated/plugin MUST be listed last.
    plugins: [...cssInteropPlugins, 'react-native-reanimated/plugin'],
  };
};
