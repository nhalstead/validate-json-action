import * as os from 'os';
import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs';
import { MockedConfig } from './mocks/mocked-config';
import { run } from '../src/action';
import * as core from '@actions/core';

let mockedConfig: MockedConfig;

describe('Github action results', () => {
    beforeEach(() => {
        mockedConfig = new MockedConfig();
        // Set default successful environment variables for the action
        process.env.GITHUB_WORKSPACE = '/github/workspace';
        process.env.INPUT_SCHEMA = 'schema.json';
        process.env.INPUT_JSONS = 'json.json';
    });

    afterEach(() => {
        mockedConfig.resetAll();
        jest.resetAllMocks();
    });

    test('No errors when all inputs are set and valid', async () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', './mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', './mocks/tested-data/valid.json');
        mockedConfig.set();

        // Act
        await run();

        // Assert
        expect(core.setFailed).not.toHaveBeenCalled();
        expect(core.info).toHaveBeenCalledWith("✅ All files were validated successfully.");
    });

    test('Error is thrown when GITHUB_WORKSPACE environment variable is not set', async () => {
        // Arrange
        mockedConfig.resetAll();
        mockedConfig.mockValue('SCHEMA', './mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', './mocks/tested-data/valid.json');
        mockedConfig.set();

        // Act
        await run();

        // Assert
        expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('Missing GITHUB_WORKSPACE environment variable'));
    });

    test('Error is thrown when SCHEMA input is not set', async () => {
        // Arrange
        mockedConfig.mockValue('JSONS', './mocks/tested-data/valid.json');
        mockedConfig.set();

        // Act
        await run();

        // Assert
        expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('Missing SCHEMA input'));
    });

    test('Error is thrown when JSONS input is not set', async () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', './mocks/schema/valid.json');
        mockedConfig.set();

        // Act
        await run();

        // Assert
        expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('Missing JSONS input'));
    });

    test('Error is thrown when GITHUB_WORKSPACE environment variable is empty', async () => {
        // Arrange
        mockedConfig.resetAll();
        mockedConfig.mockValue('GITHUB_WORKSPACE', '');
        mockedConfig.mockValue('SCHEMA', './mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', './mocks/tested-data/valid.json');
        mockedConfig.set();

        // Act
        await run();

        // Assert
        expect(core.setFailed).toHaveBeenCalledWith(`Missing GITHUB_WORKSPACE environment variable\nMissing SCHEMA input\nMissing JSONS input`);
    });

    test('Error is thrown when SCHEMA input is empty', async () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', '');
        mockedConfig.mockValue('JSONS', './mocks/tested-data/valid.json');
        mockedConfig.set();

        // Act
        await run();

        // Assert
        expect(core.setFailed).toHaveBeenCalledWith(`Missing SCHEMA input\nMissing JSONS input`);
    });

    test('Error is thrown when JSONS input is empty', async () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', './mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', '');
        mockedConfig.set();

        // Act
        await run();

        // Assert
        expect(core.setFailed).toHaveBeenCalledWith(`Missing SCHEMA input\nMissing JSONS input`);
    });

    test('Error is thrown when both SCHEMA and JSONS inputs are empty', async () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', '');
        mockedConfig.mockValue('JSONS', '');
        mockedConfig.set();

        // Act
        await run();

        // Assert
        expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining(`Missing SCHEMA input\nMissing JSONS input`));
    });
});
