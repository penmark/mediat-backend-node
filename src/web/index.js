const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const asset = require('./routes/asset')
const auth = require('./routes/auth')
const util = require('../util')
const cors = require('cors')

const jsonQuery = () => {
  return (req, res, next) => {
    req.jsonQuery = new Map();
    Object.keys(req.query).forEach(param => {
      try {
        req.jsonQuery.set(param, JSON.parse(req.query[param]))
      } catch (err) {
        // leave as-is
      }
    })
    next()
  }
}

const jsonError = (app) => {
  return (err, req, res, next) => {
    app.log.error(err)
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500)
      .send({message: err.message, error: err})
  }
}

const remoteUser = () => {
  return (req, res, next) => {
    req.user = req.get('REMOTE_USER')
    next()
  }
}

module.exports = (app) => {
  return express()
    .use(morgan('dev'))
    .use(cors())
    .use(bodyParser.urlencoded({extended: true}))
    .use(bodyParser.json())
    .use(express.static(app.config.static))
    .use(jsonQuery())
    .use(remoteUser())
    .use('/asset', asset(app))
    .use('/auth', auth(app))
    .use(jsonError(app))

}
