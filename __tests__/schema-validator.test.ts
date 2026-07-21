import { schemaValidator } from '../src/schema-validator';
import { InvalidSchemaError, InvalidJsonError } from '../src/errors';

import validSchema from './mocks/schema/valid.json';
import invalidSchema from './mocks/schema/invalid.json';

import validData from './mocks/tested-data/valid.json';
import invalidData from './mocks/tested-data/invalid_by_schema.json';

jest.mock('better-ajv-errors');
import betterAjvErrors from 'better-ajv-errors';

describe('Prepare and validate JSON schema', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
    });

    test('should return when schema is valid', async () => {
        expect(() => schemaValidator.prepareSchema(validSchema)).not.toThrow();
        expect(schemaValidator.getSchema()).toEqual(validSchema);
    });

    test('should throw an error when schema is invalid', async () => {
        expect(() => schemaValidator.prepareSchema(invalidSchema)).toThrow(InvalidSchemaError);
        expect(() => schemaValidator.getSchema()).toThrow(Error);
    });
});

describe('Validate JSON matches schema', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
    });

    test('should return true when validating JSON data that matches the schema', async () => {
        schemaValidator.prepareSchema(validSchema);
        const result = schemaValidator.validate(validData);
        expect(result).toBe(true);
        expect(betterAjvErrors).not.toHaveBeenCalled();
    });

    test("should throw an error when validating JSON data that doesn't match the schema", async () => {
        (betterAjvErrors as jest.Mock<any>).mockImplementation(() => 'Some errors');

        schemaValidator.prepareSchema(validSchema);

        expect(() => {
            schemaValidator.validate(invalidData);
        }).toThrow(InvalidJsonError);

        try {
            schemaValidator.validate(invalidData);
        } catch (e) {
            const err = e as InvalidJsonError;
            expect(err.enrichedError).toEqual('Some errors');
            expect(betterAjvErrors).toHaveBeenCalled();
        }
    });

    test('should throw an error when validate is called before prepareSchema', () => {
        const freshValidator = new (schemaValidator.constructor as any)();
        expect(() => freshValidator.validate(validData)).toThrow('Schema not prepared');
    });
});
