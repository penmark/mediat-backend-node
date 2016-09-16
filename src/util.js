const Promise = require('bluebird')
const ObjectId = require('mongodb').ObjectId

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
    return (err, req, res, next) => {
        console.error('err', err)
        if (res.headersSent) {
            console.log('headersSent')
            return next(err);
        }
        res.status(err.status || 500).send({message: err.message, error: err})
    }
}

