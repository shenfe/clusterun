const spend = d => {
    const then = Date.now();
    while (Date.now() - then < d);
}

const wait = d => {
    return new Promise(resolve => setTimeout(_ => resolve(1), d));
};

module.exports = {
    spend,
    wait
};