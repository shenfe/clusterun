const { clusterun, registerTask, dispatchTask, whoami, ifMaster } = require('../src');

const { spend, wait } = require('./helper');

const number = 100;

/////////////////////////////////////////////////////////////////////

let handler = async function (taskData) {
    // await wait(1000);
    spend(100);
    return taskData * taskData;
};

console.time('all done');
(async () => {
    for (let i = 0; i < number; i++) {
        await handler(Math.round(Math.random() * 10000));
        if (i === number - 1) {
            console.timeEnd('all done');
            process.exit();
        }
    }
})();

/////////////////////////////////////////////////////////////////////
