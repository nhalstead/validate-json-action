import * as core from '@actions/core';
import { run } from '../src/action';
import { getConfig, verifyConfigValues } from '../src/config';
import { validateJsons } from '../src/json-validator';
import { globSync } from 'glob';

jest.mock('@actions/core');
jest.mock('../src/config');
jest.mock('../src/json-validator');
jest.mock('glob');

describe('main run', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should run successfully when all files are valid', async () => {
        (getConfig as jest.Mock).mockReturnValue({
            GITHUB_WORKSPACE: '/work',
            SCHEMA: 'schema.json',
            JSONS: 'file1.json,file2.json'
        });
        (verifyConfigValues as jest.Mock).mockReturnValue(undefined);
        (validateJsons as jest.Mock).mockResolvedValue([
            { filePath: 'file1.json', valid: true },
            { filePath: 'file2.json', valid: true }
        ]);

        await run();

        expect(core.setOutput).toHaveBeenCalledWith('INVALID', '');
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining('All files were validated successfully'));
        expect(core.setFailed).not.toHaveBeenCalled();
    });

    it('should fail when some files are invalid', async () => {
        (getConfig as jest.Mock).mockReturnValue({
            GITHUB_WORKSPACE: '/work',
            SCHEMA: 'schema.json',
            JSONS: 'file1.json'
        });
        (verifyConfigValues as jest.Mock).mockReturnValue(undefined);
        (validateJsons as jest.Mock).mockResolvedValue([
            { filePath: 'file1.json', valid: false }
        ]);

        await run();

        expect(core.setOutput).toHaveBeenCalledWith('INVALID', 'file1.json');
        expect(core.setFailed).toHaveBeenCalledWith('Failed to validate all JSON files.');
    });

    it('should fail when configuration is missing', async () => {
        (getConfig as jest.Mock).mockReturnValue({});
        (verifyConfigValues as jest.Mock).mockReturnValue(['Missing SCHEMA']);

        await run();

        expect(core.setFailed).toHaveBeenCalledWith('Missing SCHEMA');
    });

    it('should expand globs in JSONS input', async () => {
        (getConfig as jest.Mock).mockReturnValue({
            GITHUB_WORKSPACE: '/work',
            SCHEMA: 'schema.json',
            JSONS: 'data/*.json'
        });
        (verifyConfigValues as jest.Mock).mockReturnValue(undefined);
        (globSync as jest.Mock).mockReturnValue(['data/file1.json', 'data/file2.json']);
        (validateJsons as jest.Mock).mockResolvedValue([
            { filePath: 'data/file1.json', valid: true },
            { filePath: 'data/file2.json', valid: true }
        ]);

        await run();

        expect(globSync).toHaveBeenCalledWith('data/*.json', { cwd: '/work' });
        expect(validateJsons).toHaveBeenCalledWith('/work', 'schema.json', ['data/file1.json', 'data/file2.json']);
    });

    it('should handle errors during execution', async () => {
        (getConfig as jest.Mock).mockImplementation(() => {
            throw new Error('Unexpected error');
        });

        await run();

        expect(core.setFailed).toHaveBeenCalledWith('Unexpected error');
    });
});
