const { clusterun, registerTask, dispatchTask, whoami } = require('../src');

const { spend, wait } = require('./helper');

let number = 100;

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
    spend(200);
    return taskData * taskData;
};

let count = 0;
let callback = function (taskName, taskSourceData, taskResultData) {
    count++;
    (count >= number) && console.timeEnd('all done');
};

clusterun(runner, handler, callback, {
    // clusterNumber: 2
});

whoami('after');
