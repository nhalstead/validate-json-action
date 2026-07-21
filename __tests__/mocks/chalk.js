const mockChalk = {
    bold: {
        underline: (str) => str,
        red: (str) => str,
        green: (str) => str,
    },
    gray: {
        bold: {
            underline: (str) => str,
        }
    },
    red: {
        bold: (str) => str,
    },
    green: {
        bold: (str) => str,
    }
};

const chalk = (str) => str;
Object.assign(chalk, mockChalk);

module.exports = chalk;
module.exports.default = chalk;