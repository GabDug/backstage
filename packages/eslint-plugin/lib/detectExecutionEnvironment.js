/*
 * Copyright 2025 The Backstage Authors
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
const ci = require('ci-info');
/**
 * @typedef {object} ExecutionEnvironment
 * @property {'cli' | 'ci' | 'lsp' | 'unknown'} type
 * @property {boolean} isLongRunning
 */

/**
 * Detects the execution environment to determine caching strategy
 *
 * If we set `isLongRunning` to `false`, we will cache the result for a long time.
 * To avoid annoying users into restarting their ESLint LSP/Plugin,
 * we should only set `isLongRunning` to `false` when we are confident about the result.
 * It's not as bad if we set `isLongRunning` to `true` for a CLI/CI usage - it'll just be a bit slower.
 * @returns {ExecutionEnvironment}
 */
function detectExecutionEnvironment() {
  const argv = process.argv.join(' ');
  const env = process.env;

  /**
   * Creates and optionally logs the execution environment result
   * @param {'cli' | 'ci' | 'lsp' | 'unknown'} type
   * @param {boolean} isLongRunning
   * @returns {ExecutionEnvironment}
   */
  const createResult = (type, isLongRunning) => {
    /** @type {ExecutionEnvironment} */
    const result = { type, isLongRunning };

    if (env.BACKSTAGE_ESLINT_PLUGIN_DEBUG_EXECUTION_ENV) {
      console.debug(
        `[detectExecutionEnvironment] Detected execution environment:`,
        {
          result,
          argv: process.argv,
        },
      );
    }

    return result;
  };

  // CI Environment Detection
  if (ci.isCI) {
    return createResult('ci', false);
  }

  // LSP/Extension Environment Detection
  const lspIndicators = [
    // VS Code
    env.VSCODE_PID,
    env.VSCODE_IPC_HOOK,
    env.VSCODE_IPC_HOOK_CLI,
    // Language Server Protocol
    env.LSP_USE_PLISTS,
    // Editor processes
    argv.includes('vscode'),
    argv.includes('code'),
    argv.includes('cursor'),
    argv.includes('language-server'),
    argv.includes('lsp'),
    // IntelliJ IDEA / Webstorm ESLint plugin
    argv.includes('js-language-service.js'),
  ];

  if (lspIndicators.some(indicator => indicator)) {
    return createResult('lsp', true);
  }

  // CLI Environment Detection
  // Check for npm/yarn script execution via environment variables
  const isNpmScript =
    env.npm_lifecycle_event || env.npm_execpath || env.npm_config_user_agent;
  const isYarnScript =
    env.npm_config_user_agent && env.npm_config_user_agent.includes('yarn');

  // Caution: Adding `eslint` directly would also match `eslint-plugin`, `eslintServer`, etc.
  const cliIndicators = [
    'backstage-cli',
    'yarn lint',
    'npm run lint',
    'pnpm lint',
  ];

  if (
    isNpmScript ||
    isYarnScript ||
    cliIndicators.some(indicator => argv.includes(indicator))
  ) {
    return createResult('cli', false);
  }

  // Default to unknown with conservative caching
  return createResult('unknown', true);
}

module.exports = { detectExecutionEnvironment };
