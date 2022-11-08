// Clean try catch for async await functions
const catchEm = (promise)  => {
    return promise.then(data => [null, data])
      .catch(err => [err]);
}

module.exports = catchEm