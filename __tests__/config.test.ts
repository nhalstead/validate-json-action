import * as core from '@actions/core';
import { getConfig, verifyConfigValues, ConfigKey } from '../src/config';

jest.mock('@actions/core');

describe('Configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('getConfig', () => {
        it('should read from environment variables and inputs', () => {
            process.env['GITHUB_WORKSPACE'] = '/home/runner/work/repo/repo';
            (core.getInput as jest.Mock).mockImplementation((name: string) => {
                if (name === 'SCHEMA') return 'schema.json';
                if (name === 'JSONS') return 'data/*.json';
                return '';
            });

            const config = getConfig();

            expect(config[ConfigKey.GITHUB_WORKSPACE]).toBe('/home/runner/work/repo/repo');
            expect(config[ConfigKey.SCHEMA]).toBe('schema.json');
            expect(config[ConfigKey.JSONS]).toBe('data/*.json');
        });
    });

    describe('verifyConfigValues', () => {
        it('should return undefined when all values are present', () => {
            const config = {
                GITHUB_WORKSPACE: '/work',
                SCHEMA: 'schema.json',
                JSONS: 'data.json'
            };

            const errors = verifyConfigValues(config);
            expect(errors).toBeUndefined();
        });

        it('should return error messages when values are missing', () => {
            const config = {
                GITHUB_WORKSPACE: '',
                SCHEMA: '',
                JSONS: ''
            };

            const errors = verifyConfigValues(config);
            expect(errors).toBeDefined();
            expect(errors).toHaveLength(3);
            expect(errors![0]).toContain('Missing GITHUB_WORKSPACE environment variable');
            expect(errors![1]).toContain('Missing SCHEMA input');
            expect(errors![2]).toContain('Missing JSONS input');
        });
    });
});
