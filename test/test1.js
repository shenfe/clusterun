const { clusterun, registerTask, dispatchTask, whoami, ifMaster } = require('../src');

const { spend, wait } = require('./helper');

const number = 100;

whoami(`before`);

/////////////////////////////////////////////////////////////////////

let runner = function () {
    whoami('runner');

    registerTask('compute', String);

    for (let i = 0; i < number; i++) {
        dispatchTask('compute', Math.round(Math.random() * 10000));
    }
};

let handler = async function (taskName, taskData) {
    // await wait(100);
    spend(100);
    return taskData * taskData;
};

let count = 0;
let callback = function (taskName, taskSourceData, taskResultData) {
    count++;
    if (count >= number) {
        console.timeEnd('all done');
        process.exit();
    }
};

console.time('all done');
clusterun(runner, handler, callback);

/////////////////////////////////////////////////////////////////////

whoami('after');

ifMaster(_=> {
    whoami('end');
});