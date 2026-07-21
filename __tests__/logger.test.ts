import * as core from '@actions/core';
import chalk from 'chalk';
import { prettyLog } from '../src/logger';
import { InvalidSchemaError, InvalidJsonError, InvalidJsonFileError } from '../src/errors';

jest.mock('@actions/core');

describe('Logger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should log success message when no error is provided', () => {
        prettyLog('test.json');
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining('✓'));
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining('test.json'));
    });

    it('should log InvalidSchemaError', () => {
        const error = new InvalidSchemaError('Invalid syntax');
        prettyLog('schema.json', error);
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining('✗'));
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Invalid syntax'));
        expect(core.error).toHaveBeenCalledWith('Invalid syntax', { file: 'schema.json' });
    });

    it('should log InvalidJsonError', () => {
        const error = new InvalidJsonError('Validation failed', 'Enriched error details');
        prettyLog('data.json', error);
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Enriched error details'));
        expect(core.error).toHaveBeenCalledWith('Enriched error details', { file: 'data.json' });
    });

    it('should log InvalidJsonFileError with Error innerError', () => {
        const innerError = new Error('File not found');
        const error = new InvalidJsonFileError('data.json', innerError);
        prettyLog('data.json', error);
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining('ErrorFile not found'));
        expect(core.error).toHaveBeenCalledWith('ErrorFile not found', { file: 'data.json' });
    });

    it('should log generic Error', () => {
        const error = new Error('Something went wrong');
        error.stack = 'stack trace';
        prettyLog('test.ts', error);
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Error - Something went wrong'));
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining('stack trace'));
        expect(core.error).toHaveBeenCalledWith('Error - Something went wrong', { file: 'test.ts' });
    });
});
