const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const debugging = false;

const consoleLog = function (...args) {
    debugging && console.log(...args);
};

// Worker Id Array
function workerIds() {
    return Object.keys(cluster.workers);
}

// Go through all workers
function eachWorker(callback) {
    const workers = workerIds().map(id => cluster.workers[id]);
    return callback ? workers.map(callback) : workers;
}

// Take a worker
function someWorker(callback) {
    for (const id in cluster.workers) {
        return callback ? callback(cluster.workers[id]) : cluster.workers[id];
    }
}

// Kill a worker
function closeWorker(worker) {
    return worker.send({ type: 'master:close' });
}

// Kill all workers
function closeWorkers() {
    return eachWorker(closeWorker);
}

// Kill some worker
function closeSomeWorker() {
    return someWorker(closeWorker);
}

// Register a task type
const taskRigister = {};
function registerTaskType(taskName, taskIdGenerator) {
    taskRigister[taskName] = taskIdGenerator;
}

// Work out a special number of a string
function charCodeSum(s) {
    let re = 0;
    for (let i = 0; i < s.length; i++) {
        re += s.charCodeAt(i);
    }
    return re;
}

// Get the task Id
function getTaskId(taskName, task) {
    return taskRigister[taskName](task);
}

// Task Id => Worker
function distributor(tid) {
    const wids = workerIds();
    const workerCount = wids.length;
    return cluster.workers[wids[charCodeSum(tid) % workerCount]];
}

// Dispatch a task to a worker
function assignTask(taskName, task) {
    return distributor(getTaskId(taskName, task)).send({
        type: 'master:task',
        task: {
            name: taskName,
            data: task
        }
    });
}

const main = (runner, handler, callback, options = {}) => {
    if (cluster.isMaster) {
        consoleLog(`主进程 ${process.pid} 正在运行`);

        const clusterNumber = options.clusterNumber || numCPUs;
        const autoRestartWorker = !!options.autoRestart;
        for (let i = 0; i < clusterNumber; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            consoleLog(`工作进程 ${worker.id} 退出:`);
            consoleLog(`exitedAfterDisconnect ${worker.exitedAfterDisconnect}, signal ${signal}, code ${code}`);
            if (autoRestartWorker) {
                consoleLog('重启...');
                cluster.fork();
            }
        });

        cluster.on('message', (worker, msg, handle) => {
            if (msg.type === 'worker:task') {
                consoleLog(`主进程接收到工作进程 ${worker.id} 执行任务 ${msg.task.name} 结果: ${msg.task.source} => ${msg.task.result}`);
                callback(msg.task.name, msg.task.source, msg.task.result);
            }
        });

        runner();
    } else {
        consoleLog(`工作进程 ${cluster.worker.id} (${process.pid}) 已启动`);
        process.on('message', async (msg) => {
            if (msg.type === 'master:task') {
                consoleLog(`工作进程 ${cluster.worker.id} 接收到主进程分派任务 ${msg.task.name}: ${msg.task.data}`);
                const result = await handler(msg.task.name, msg.task.data);
                process.send({
                    type: 'worker:task',
                    task: {
                        name: msg.task.name,
                        source: msg.task.data,
                        result: result
                    }
                });
            }
        });
    }
};

const whoami = (flag, silent) => {
    const log = (...args) => {
        !silent && console.log(...args);
    };
    let logArgs = flag;
    if (typeof flag !== 'function') {
        let flags = flag;
        if (typeof flag !== 'object') {
            flags = {
                '0': `i am master (${process.pid})  ~~~~~~~~~~~~~~~~ ${flag}`,
                '1': () => `i am worker (${process.pid} as ${cluster.worker.id}) ~~~~~~~~~~~~~~~~ ${flag}`,
                '-1': `i am nothing ~~~~~~~~~~~~~~~~ ${flag}`
            };
        }
        logArgs = r => (typeof flags[r] !== 'function' ? flags[r] : flags[r]());
    }
    let r = -1;
    if (cluster.isMaster) {
        r = 0;
    } else if (cluster.isWorker) {
        r = 1;
    }
    log(logArgs(r));
    return r;
};

const ifMaster = fn => {
    if (cluster.isMaster) {
        fn && fn();
        return true;
    }
    return false;
};

const ifWorker = fn => {
    if (cluster.isWorker) {
        fn && fn();
        return true;
    }
    return false;
};

module.exports = {
    registerTask: registerTaskType,
    dispatchTask: assignTask,
    clusterun: main,
    whoami,
    ifMaster,
    ifWorker
};
