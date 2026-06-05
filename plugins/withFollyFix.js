const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const PATCH_MARKER = '# [withFollyFix] applied';

// FOLLY_HAS_COROUTINES=0  → prevents folly/Expected.h and folly/Optional.h from
// pulling in folly/coro/Coroutine.h, which is absent from the prebuilt
// ReactNativeDependencies pod.  C++20 is still required by RNReanimated itself.
const POST_INSTALL_PATCH = `
    ${PATCH_MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
        defs = config.build_settings['GCC_PREPROCESSOR_DEFINITIONS']
        case defs
        when nil
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = ['$(inherited)', 'FOLLY_HAS_COROUTINES=0']
        when String
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = [defs, 'FOLLY_HAS_COROUTINES=0']
        when Array
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs + ['FOLLY_HAS_COROUTINES=0']
        end
      end
    end`;

const withFollyFix = (config) =>
  withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      );
      let podfile = fs.readFileSync(podfilePath, 'utf-8');

      if (podfile.includes(PATCH_MARKER)) {
        return config; // already patched
      }

      podfile = podfile.replace(
        /(\s*post_install do \|installer\|)/,
        `$1${POST_INSTALL_PATCH}`,
      );

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);

module.exports = withFollyFix;
