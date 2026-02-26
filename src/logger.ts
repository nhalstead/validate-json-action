import * as core from '@actions/core';
import chalk from 'chalk';
import { InvalidSchemaError, InvalidJsonError, InvalidJsonFileError } from './errors';

export const prettyLog = (filePath: string, error?: Error): void => {
    const prettyFilePath = chalk.gray.bold.underline(filePath);
    const prettyMessagePrefix = error ? chalk.red.bold('✗ ') : chalk.green.bold('✓ ');
    
    let message = '';
    let plainMessage = '';

    switch (true) {
        case error instanceof InvalidSchemaError:
            const schemaErr = error as InvalidSchemaError;
            message = schemaErr.reason;
            plainMessage = schemaErr.reason;
            break;
        case error instanceof InvalidJsonError:
            const jsonErr = error as InvalidJsonError;
            message = jsonErr.enrichedError || jsonErr.reason;
            plainMessage = jsonErr.enrichedError || jsonErr.reason;
            break;
        case error instanceof InvalidJsonFileError:
            const fileErr = error as InvalidJsonFileError;
            const reason =
                fileErr.innerError instanceof Error
                    ? `${fileErr.innerError.name}${fileErr.innerError.message}`
                    : (fileErr.innerError as unknown as string) || '';
            message = reason;
            plainMessage = reason;
            break;
        case error instanceof Error:
            const err = error as Error;
            message = `${err.name} - ${err.message}\n${err.stack}`;
            plainMessage = `${err.name} - ${err.message}`;
            break;
        default:
            break;
    }

    if (error) {
        core.info(`${prettyMessagePrefix}${prettyFilePath}\n${message}`);
        core.error(plainMessage, { file: filePath });
    } else {
        core.info(`${prettyMessagePrefix}${prettyFilePath}`);
    }
};
