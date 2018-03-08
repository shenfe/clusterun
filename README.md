# clusterun

💠 Run tasks in cluster mode easily, for CPU-intensive programs.

## Installation

```bash
$ npm install clusterun --save
```

## Usage

### function `clusterun`

Master => Workers => Master

```js
const { clusterun, registerTask, dispatchTask } = require('clusterun');

const runner = function () {
    // run by Master, to create tasks and dispatch them to Workers
};

const handler = async function (taskName, taskData) {
    let result;
    // run by Workers, to process tasks and produce results
    return result;
};

const callback = function (taskName, taskSourceData, taskResultData) {
    // run by Master, to handle task results
};

clusterun(runner, handler, callback, {
    clusterNumber: 2, // number of clusters; optional; default: number of CPU
    autoRestart: true, // whether to restart a dead Worker automatically; optional; default: false
});
```

### function `registerTask`

Register a type of task, with a hash-of-task-data function. Called by Master.

```js
registerTask('my-computing-task', aHashCodeFunctionForTaskData);
```

### function `dispatchTask`

Dispatch a task to Worker. Called by Master.

```js
dispatchTask('my-computing-task', taskData);
```

### helper functions

name | function | usage
:---: | :--- | :---
whoami | check the role of the current process, and output logs if any | `role = whoami()` `whoami('computing task A')`
ifMaster | run if the current is Master | `ifMaster() && doSth()` `ifMaster(doSth)`
ifWorker | run if the current is Worker | `ifWorker() && doSth()` `ifWorker(doSth)`

## License

MIT
