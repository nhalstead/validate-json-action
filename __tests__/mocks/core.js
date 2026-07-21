module.exports = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    setFailed: jest.fn(),
    setOutput: jest.fn(),
    getInput: jest.fn((name) => {
        const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
        if (typeof val === 'string') {
            return val.trim();
        }
        return val;
    }),
    startGroup: jest.fn(),
    endGroup: jest.fn(),
};