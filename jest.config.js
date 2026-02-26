module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['js', 'ts'],
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    verbose: true,
    setupFilesAfterEnv: ['./__tests__/setup.ts'],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: './test-reports',
                outputName: 'junit.xml',
            },
        ],
    ],
};
