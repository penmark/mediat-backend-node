const Promise = require('bluebird')

exports.wrap = (func) => {
  const cr = Promise.coroutine(func)
  return (req, res, next) => {
    cr(req, res, next).catch(next)
  }
}
