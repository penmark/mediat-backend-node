const Promise = require('bluebird')

exports.wrap = (func) => {
  const cr = Promise.coroutine(func)
  return (req, res, next) => {
    cr(req, res, next).catch(next)
  }
}

exports.jsonQuery = () => {
  return (req, res, next) => {
    req.jsonQuery = new Map();
    Object.keys(req.query).forEach(param => {
      try {
        req.jsonQuery.set(param, JSON.parse(req.query[param]))
      } catch (err) {
        err.status = 400
        next(err)
      }
    })
    next()
  }
}

exports.errorHandler = () => {
  return (error, req, res, next) => {
    console.error('err', error)
    if (res.headersSent) {
      return next(error);
    }
    res.status(error.status || 500)
      .send({message: error.message, error})
  }
}

