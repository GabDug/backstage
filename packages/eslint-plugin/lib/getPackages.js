/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @ts-check

const path = require('path');
const manypkg = require('@manypkg/get-packages');
const { detectExecutionEnvironment } = require('./detectExecutionEnvironment');

/**
 * @typedef ExtendedPackage
 * @type {import('@manypkg/get-packages').Package & { packageJson: { exports?: Record<string, string>, files?: Array<string>, backstage?: { inline?: boolean } }}} packageJson
 */

/**
 * @typedef PackageMap
 * @type object
 *
 * @property {ExtendedPackage} root
 * @property {ExtendedPackage[]} list
 * @property {Map<string, ExtendedPackage>} map
 * @property {() => void} clearCache
 * @property {(path: string) => ExtendedPackage | undefined} byPath
 */

// Loads all packages in the monorepo once, and caches the result
module.exports = (function () {
  /** @type {PackageMap | undefined} */
  let result = undefined;
  /** @type {number} */
  let lastLoadAt = 0;

  // Detect execution environment once
  const execEnv = detectExecutionEnvironment();

  // Determine cache expiration based on environment
  const getCacheExpirationMs = () => {
    if (execEnv.isLongRunning) {
      // For LSP servers and other long-running processes, use 5-second cache
      // to avoid the need to reload ESLint servers while keeping data fresh
      return 5_000;
    } else {
      // For CLI and CI environments, set a long cache expiration since processes are short-lived
      // This avoids unnecessary cache invalidation during quick lint runs
      return 30 * 60 * 1000; // 30 minutes
    }
  };

  const cacheExpirationMs = getCacheExpirationMs();

  /** @returns {PackageMap | undefined} */
  return function getPackages(/** @type {string} */ dir) {
    if (result) {
      // Apply environment-specific cache expiration
      if (Date.now() - lastLoadAt > cacheExpirationMs) {
        result = undefined;
      } else {
        return result;
      }
    }

    const packages = manypkg.getPackagesSync(dir);
    if (!packages) {
      return undefined;
    }

    result = {
      map: new Map(packages.packages.map(pkg => [pkg.packageJson.name, pkg])),
      list: packages.packages,
      root: packages.root,
      byPath(filePath) {
        return packages.packages.find(
          pkg => !path.relative(pkg.dir, filePath).startsWith('..'),
        );
      },
      clearCache() {
        result = undefined;
      },
    };

    lastLoadAt = Date.now();
    return result;
  };
})();
