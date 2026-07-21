import * as core from '@actions/core';
import { getConfig, verifyConfigValues } from './config';
import { validateJsons } from './json-validator';
import { globSync } from 'glob';

export async function run() {
    try {
        const config = getConfig();
        const configErrors = verifyConfigValues(config);
        if (configErrors) {
            configErrors.forEach(e => core.error(e));
            core.setFailed('Missing configuration');
            return;
        }

        const jsonRelativePaths = config.JSONS.split(',')
            // Expand all glob formulas
            .reduce((accum: string[], current) => {
                if (current.indexOf('*') === -1) {
                    return [...accum, current];
                }

                // Replace backslashes with forward slashes for glob compatibility
                const globFormula = current.replace(/\\/g, '/');
                const expandedGlob = globSync(globFormula, { cwd: config.GITHUB_WORKSPACE });
                return [...accum, ...expandedGlob];
            }, []);

        const validationResults = await validateJsons(
            config.GITHUB_WORKSPACE,
            config.SCHEMA,
            jsonRelativePaths
        );

        const invalidJsons = validationResults
            .filter(res => !res.valid)
            .map(res => res.filePath);

        core.setOutput('INVALID', invalidJsons.length > 0 ? invalidJsons.join(',') : '');

        if (invalidJsons.length > 0) {
            core.setFailed('Failed to validate all JSON files.');
        } else {
            core.info(`✅ All files were validated successfully.`);
        }
    } catch (error) {
        core.setFailed((error as Error).message);
    }
}
