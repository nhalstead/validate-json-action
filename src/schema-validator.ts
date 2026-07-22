import { Ajv } from 'ajv';
import addFormats from 'ajv-formats';
import type { AnySchema, ValidateFunction } from 'ajv';
import betterAjvErrors from 'better-ajv-errors';
import { InvalidSchemaError, InvalidJsonError } from './errors';

class SchemaValidator {
    private validator: Ajv;
    private validatorFunc?: ValidateFunction;

    constructor() {
        this.validator = new Ajv({ allErrors: true });
        addFormats(this.validator);
    }

    public prepareSchema(schema: object): void {
        this.validatorFunc = undefined;
        const isSchemaValid = this.validator.validateSchema(schema);
        if (!isSchemaValid) {
            const errors = this.validator.errorsText(this.validator.errors);
            throw new InvalidSchemaError(errors);
        }

        this.validatorFunc = this.validator.compile(schema);
    }

    public getSchema(): AnySchema {
        if (!this.validatorFunc) {
            throw new Error('Schema not prepared');
        }

        return this.validatorFunc.schema;
    }

    public validate(data: object): boolean {
        if (!this.validatorFunc) {
            throw new Error('Schema not prepared');
        }

        const valid = this.validatorFunc(data);

        if (!valid) {
            const errors = this.validator.errorsText(this.validatorFunc.errors);
            const output = betterAjvErrors(this.getSchema(), data, this.validatorFunc.errors || [], {
                format: 'cli',
                indent: 4,
            });
            throw new InvalidJsonError(errors, (output || '') as string);
        }

        return valid;
    }
}

export const schemaValidator = new SchemaValidator();
