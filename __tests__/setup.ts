export const spyOnLog = jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn());

jest.mock('@actions/core', () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warning: jest.fn(),
    setFailed: jest.fn(),
    setOutput: jest.fn(),
    getInput: jest.fn(),
}));
