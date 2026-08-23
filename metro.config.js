const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Keep NativeWind CSS virtual during Metro web export; writing into
  // node_modules/react-native-css-interop/.cache breaks Vercel SHA-1 hashing.
});
