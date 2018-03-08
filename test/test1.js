const { clusterun, registerTask, dispatchTask, whoami, ifMaster } = require('../src');

const { spend, wait } = require('./helper');

const number = 100;

setInterval(() => {
    // whoami(`before, interval`);
}, 1000);

/////////////////////////////////////////////////////////////////////

let runner = function () {
    console.time('all done');
    whoami('runner');

    registerTask('compute', String);

    for (let i = 0; i < number; i++) {
        dispatchTask('compute', Math.round(Math.random() * 10000));
    }
};

let handler = async function (taskName, taskData) {
    // await wait(1000);
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

clusterun(runner, handler, callback);

/////////////////////////////////////////////////////////////////////

whoami('after');

ifMaster(_=> {
    whoami('end');
});