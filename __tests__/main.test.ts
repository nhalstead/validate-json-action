import * as os from 'os';
import * as process from 'process';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';
import { MockedConfig } from './mocks/mocked-config';

let mockedConfig: MockedConfig;
let ip: string;

describe('Github action results', () => {
    beforeEach(() => {
        ip = path.join(__dirname, '..', 'lib', 'main.js');
        mockedConfig = new MockedConfig();
    });

    afterEach(() => {
        ip = '';
        mockedConfig.resetAll();
        jest.resetAllMocks();
    });

    test('No errors when all inputs are set and valid', () => {
        // Arrange
        const outputFile = path.join(os.tmpdir(), `github_output_${Date.now()}`);
        fs.writeFileSync(outputFile, '');
        mockedConfig.mockValue('SCHEMA', './mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', './mocks/tested-data/valid.json');

        mockedConfig.set();

        const options = {
            env: {
                ...process.env,
                GITHUB_OUTPUT: outputFile,
            },
        };

        // Act
        try {
            cp.execSync(`node ${ip}`, options);
        } catch (e) {
            console.error((e as any).output.toString());
            throw e;
        }

        // Assert
        const output = fs.readFileSync(outputFile, 'utf8');
        fs.unlinkSync(outputFile);
        expect(output).toContain(`INVALID`);
    });

    test('Error is thrown when GITHUB_WORKSPACE environment variable is not set', () => {
        // Arrange
        mockedConfig.resetAll();
        mockedConfig.mockValue('SCHEMA', './mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', './mocks/tested-data/valid.json');

        mockedConfig.set();

        const options = {
            env: process.env,
        };

        try {
            // Act
            cp.execSync(`node ${ip}`, options);
        } catch (ex: any) {
            // Assert
            expect(ex).not.toBeUndefined();
            expect(ex.output).not.toBeUndefined();
            expect(ex.output.toString()).toContain(`Missing GITHUB_WORKSPACE environment variable`);
        }
    });

    test('Error is thrown when SCHEMA input is not set', () => {
        // Arrange
        mockedConfig.mockValue('JSONS', './mocks/tested-data/valid.json');

        mockedConfig.set();

        const options = {
            env: process.env,
        };

        try {
            // Act
            cp.execSync(`node ${ip}`, options);
        } catch (ex: any) {
            // Assert
            expect(ex).not.toBeUndefined();
            expect(ex.output).not.toBeUndefined();
            expect(ex.output.toString()).toContain(`Missing SCHEMA input`);
        }
    });

    test('Error is thrown when JSONS input is not set', () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', './mocks/schema/valid.json');

        mockedConfig.set();

        const options = {
            env: process.env,
        };

        try {
            // Act
            cp.execSync(`node ${ip}`, options);
        } catch (ex: any) {
            // Assert
            expect(ex).not.toBeUndefined();
            expect(ex.output).not.toBeUndefined();
            expect(ex.output.toString()).toContain(`Missing JSONS input`);
        }
    });

    test('Error is thrown when GITHUB_WORKSPACE environment variable is empty', () => {
        // Arrange
        mockedConfig.resetAll();
        mockedConfig.mockValue('GITHUB_WORKSPACE', '');
        mockedConfig.mockValue('SCHEMA', './mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', './mocks/tested-data/valid.json');

        mockedConfig.set();

        const options = {
            env: process.env,
        };

        try {
            // Act
            cp.execSync(`node ${ip}`, options);
        } catch (ex: any) {
            // Assert
            expect(ex).not.toBeUndefined();
            expect(ex.output).not.toBeUndefined();
            expect(ex.output.toString()).toContain(`Missing GITHUB_WORKSPACE environment variable`);
            expect(ex.output.toString()).not.toContain(`Missing SCHEMA input`);
            expect(ex.output.toString()).not.toContain(`Missing JSONS input`);
        }
    });

    test('Error is thrown when SCHEMA input is empty', () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', '');
        mockedConfig.mockValue('JSONS', './mocks/tested-data/valid.json');

        mockedConfig.set();

        const options = {
            env: process.env,
        };

        try {
            // Act
            cp.execSync(`node ${ip}`, options);
        } catch (ex: any) {
            // Assert
            expect(ex).not.toBeUndefined();
            expect(ex.output).not.toBeUndefined();
            expect(ex.output.toString()).toContain(`Missing SCHEMA input`);
            expect(ex.output.toString()).not.toContain(`Missing JSONS input`);
        }
    });

    test('Error is thrown when JSONS input is empty', () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', './mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', '');

        mockedConfig.set();

        const options = {
            env: process.env,
        };

        try {
            // Act
            cp.execSync(`node ${ip}`, options);
        } catch (ex: any) {
            // Assert
            expect(ex).not.toBeUndefined();
            expect(ex.output).not.toBeUndefined();
            expect(ex.output.toString()).not.toContain(`Missing SCHEMA input`);
            expect(ex.output.toString()).toContain(`Missing JSONS input`);
        }
    });

    test('Error is thrown when both SCHEMA and JSONS inputs are empty', () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', '');
        mockedConfig.mockValue('JSONS', '');

        mockedConfig.set();

        const options = {
            env: process.env,
        };

        try {
            // Act
            cp.execSync(`node ${ip}`, options);
        } catch (ex: any) {
            // Assert
            expect(ex).not.toBeUndefined();
            expect(ex.output).not.toBeUndefined();
            expect(ex.output.toString()).toContain(`Missing SCHEMA input`);
            expect(ex.output.toString()).toContain(`Missing JSONS input`);
        }
    });
});
