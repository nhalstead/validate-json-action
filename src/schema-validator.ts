import Ajv, { AnySchemaObject, ErrorObject, ValidateFunction } from 'ajv';
import betterAjvErrors from 'better-ajv-errors';
import { request } from 'http';
import { InvalidSchemaError, InvalidJsonError } from './errors';

class SchemaValidator {
    private schemaValidator: Ajv;

    constructor() {
        this.schemaValidator = new Ajv({ allErrors: true, loadSchema: this.loadSchema, strict: false, logger: false });
    }

    public instance(): Ajv {
        return this.schemaValidator;
    }

    public async prepareSchema(schema: object): Promise<ValidateFunction> {
        const isSchemaValid = this.schemaValidator.validateSchema(schema);
        if (!isSchemaValid) {
            const errors = this.schemaValidator.errorsText(this.schemaValidator.errors);
            throw new InvalidSchemaError(errors);
        }

        return await this.schemaValidator.compileAsync(schema);
    }

    public async validate(data: object, validator: ValidateFunction): Promise<boolean> {
        const valid = await validator(data);

        if (!valid) {
            const errors = this.schemaValidator.errorsText(validator.errors);
            const output = betterAjvErrors(validator.schema, data, validator.errors as ErrorObject<string, Record<string, any>, unknown>[], { format: 'cli', indent: 4 });
            throw new InvalidJsonError(errors, (output || {}) as string);
        }

        return valid;
    }

    private loadSchema(uri: string): Promise<AnySchemaObject> {
        return new Promise((resolve, reject) => {
            request(uri, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            }, res => {
                if (!res.statusCode || res.statusCode >= 400) reject(`Reached an out of bounds status code ${res.statusCode}`);
                var str = '';
                res.on('data', chunk => {
                    str += chunk;
                });
                res.on('end', () => {
                    resolve(JSON.parse(str));
                })
            })
        })
    }
}

export const schemaValidator = new SchemaValidator();
