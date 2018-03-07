const { clusterun, registerTask, dispatchTask } = require('../src');

let number = 10000;

let runner = function () {
    registerTask('compute', String);

    for (let i = 0; i < number; i++) {
        dispatchTask('compute', Math.round(Math.random() * 10000));
    }
};

let handler = function (taskName, taskData) {
    return taskData * taskData;
};

let count = 0;
let callback = function (taskName, taskSourceData, taskResultData) {
    // console.log(...arguments);
    count++;
    if (count >= number) {
        console.timeEnd('all done')
    }
};

console.time('all done');
clusterun(runner, handler, callback);
