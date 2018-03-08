const child_process = require('child_process');

const path = require('path');

child_process.execFile('node', [path.resolve(__dirname, './test1.js')], (error, stdout, stderr) => {
    if (error) {
        throw error;
    }
    console.log(stdout);
});
child_process.execFile('node', [path.resolve(__dirname, './test2.js')], (error, stdout, stderr) => {
    if (error) {
        throw error;
    }
    console.log(stdout);
});