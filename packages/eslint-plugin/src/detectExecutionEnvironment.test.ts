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

describe('detectExecutionEnvironment', () => {
  const originalArgv = process.argv;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset process.argv
    process.argv = ['node', 'test'];

    // Clear CI-related environment variables
    const ciEnvVars = [
      'CI',
      'CONTINUOUS_INTEGRATION',
      'GITHUB_ACTIONS',
      'GITLAB_CI',
      'JENKINS_URL',
      'BUILDKITE',
      'CIRCLECI',
      'TRAVIS',
      'AZURE_HTTP_USER_AGENT',
      'TF_BUILD',
      'BITBUCKET_COMMIT',
      'APPVEYOR',
      'NETLIFY',
      'VERCEL',
      'NOW_BUILDER',
      // LSP/Editor environment variables
      'VSCODE_PID',
      'VSCODE_IPC_HOOK',
      'VSCODE_IPC_HOOK_CLI',
      'LSP_USE_PLISTS',
      // npm/yarn environment variables
      'npm_lifecycle_event',
      'npm_execpath',
      'npm_config_user_agent',
    ];

    ciEnvVars.forEach(envVar => {
      delete process.env[envVar];
    });
  });

  afterEach(() => {
    // Reset modules to ensure fresh require of ci-info and detectExecutionEnvironment
    jest.resetModules();
  });

  afterAll(() => {
    // Restore original values
    process.argv = originalArgv;
    process.env = originalEnv;
  });

  describe('CI Environment Detection', () => {
    it('should detect GitHub Actions', () => {
      process.env.GITHUB_ACTIONS = 'true';

      // Reset modules to pick up new environment variables
      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'ci',
        isLongRunning: false,
      });

      delete process.env.GITHUB_ACTIONS;
    });

    it('should detect GitLab CI', () => {
      process.env.GITLAB_CI = 'true';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'ci',
        isLongRunning: false,
      });

      delete process.env.GITLAB_CI;
    });

    it('should detect generic CI environment', () => {
      process.env.CI = 'true';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'ci',
        isLongRunning: false,
      });

      delete process.env.CI;
    });
  });

  describe('LSP/Extension Environment Detection', () => {
    it('should detect Webstorm built-in eslint plugin', () => {
      process.argv = [
        'abc',
        '/Users/john/Applications/WebStorm.app/Contents/plugins/javascript-plugin/jsLanguageServicesImpl/js-language-service.js',
        '-id=12345',
        '-debug-name=eslint',
      ];

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'lsp',
        isLongRunning: true,
      });
    });

    it('should detect VS Code extension environment', () => {
      process.env.VSCODE_PID = '12345';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'lsp',
        isLongRunning: true,
      });

      delete process.env.VSCODE_PID;
    });

    it('should detect VS Code IPC hook', () => {
      process.env.VSCODE_IPC_HOOK = '/tmp/vscode-ipc-12345.sock';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'lsp',
        isLongRunning: true,
      });

      delete process.env.VSCODE_IPC_HOOK;
    });

    it('should detect VS Code CLI hook', () => {
      process.env.VSCODE_IPC_HOOK_CLI = '/tmp/vscode-ipc-cli-12345.sock';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'lsp',
        isLongRunning: true,
      });

      delete process.env.VSCODE_IPC_HOOK_CLI;
    });

    it('should detect Cursor editor', () => {
      process.argv = ['node', '/path/to/cursor', '--inspect'];

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'lsp',
        isLongRunning: true,
      });
    });

    it('should detect language server process', () => {
      process.argv = ['node', '/path/to/language-server', '--stdio'];

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'lsp',
        isLongRunning: true,
      });
    });

    it('should detect LSP process', () => {
      process.argv = ['node', '/path/to/lsp-server'];

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'lsp',
        isLongRunning: true,
      });
    });
  });

  describe('CLI Environment Detection', () => {
    it('should detect npm script execution', () => {
      process.env.npm_lifecycle_event = 'lint';
      process.env.npm_execpath = '/usr/local/bin/npm';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'cli',
        isLongRunning: false,
      });

      delete process.env.npm_lifecycle_event;
      delete process.env.npm_execpath;
    });

    it('should detect yarn script execution', () => {
      process.env.npm_config_user_agent =
        'yarn/1.22.19 npm/? node/v18.17.0 darwin x64';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'cli',
        isLongRunning: false,
      });

      delete process.env.npm_config_user_agent;
    });

    it('should detect backstage-cli execution', () => {
      process.argv = ['node', '/path/to/backstage-cli', 'lint'];

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'cli',
        isLongRunning: false,
      });
    });

    it('should detect yarn lint command', () => {
      process.argv = ['node', '/usr/local/bin/yarn', 'lint'];

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'cli',
        isLongRunning: false,
      });
    });

    it('should detect npm run lint command', () => {
      process.argv = ['node', '/usr/local/bin/npm', 'run', 'lint'];

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'cli',
        isLongRunning: false,
      });
    });
  });

  describe('Real-world Scenarios', () => {
    it('should detect VS Code terminal running npm script', () => {
      // VS Code terminal with npm script
      process.env.VSCODE_PID = '12345';
      process.env.npm_lifecycle_event = 'lint';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      // LSP detection takes precedence over CLI
      expect(result).toEqual({
        type: 'lsp',
        isLongRunning: true,
      });

      delete process.env.VSCODE_PID;
      delete process.env.npm_lifecycle_event;
    });

    it('should detect GitHub Actions with npm script', () => {
      // GitHub Actions running npm script
      process.env.GITHUB_ACTIONS = 'true';
      process.env.npm_lifecycle_event = 'lint';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      // CI detection takes precedence over CLI
      expect(result).toEqual({
        type: 'ci',
        isLongRunning: false,
      });

      delete process.env.GITHUB_ACTIONS;
      delete process.env.npm_lifecycle_event;
    });

    it('should detect VS Code extension ESLint server', () => {
      // VS Code ESLint extension running language server
      process.env.VSCODE_PID = '12345';
      process.argv = ['node', '/path/to/eslintServer.js', '--node-ipc'];

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'lsp',
        isLongRunning: true,
      });

      delete process.env.VSCODE_PID;
    });

    it('should handle mixed environment variables correctly', () => {
      // Multiple environment indicators - CI should take precedence
      process.env.CI = 'true';
      process.env.npm_lifecycle_event = 'test';
      process.argv = ['node', '/path/to/backstage-cli', 'test'];

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'ci',
        isLongRunning: false,
      });

      delete process.env.CI;
      delete process.env.npm_lifecycle_event;
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty environment', () => {
      // Completely clean environment
      process.argv = ['node'];

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'unknown',
        isLongRunning: true,
      });
    });

    it('should handle npm user agent without yarn', () => {
      process.env.npm_config_user_agent =
        'npm/8.19.2 node/v18.17.0 darwin x64 workspaces/false';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'cli',
        isLongRunning: false,
      });

      delete process.env.npm_config_user_agent;
    });

    it('should handle false positive environment variables', () => {
      // Environment variable exists but is empty/false
      process.env.CI = '';
      process.env.npm_lifecycle_event = 'start';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'cli',
        isLongRunning: false,
      });

      delete process.env.CI;
      delete process.env.npm_lifecycle_event;
    });

    it('should not detect CI when CI is explicitly set to false', () => {
      process.env.CI = 'false';

      jest.resetModules();
      const {
        detectExecutionEnvironment,
      } = require('../lib/detectExecutionEnvironment');

      const result = detectExecutionEnvironment();

      expect(result).toEqual({
        type: 'unknown',
        isLongRunning: true,
      });

      delete process.env.CI;
    });
  });
});
