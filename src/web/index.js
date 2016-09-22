const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const item = require('./routes/item')
const util = require('../util')

const jsonQuery = () => {
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

const jsonError = () => {
  return (error, req, res, next) => {
    console.error('err', error)
    if (res.headersSent) {
      return next(error);
    }
    res.status(error.status || 500)
      .send({message: error.message, error})
  }
}

module.exports = (app) => {
  return express()
    .use(morgan('dev'))
    .use(require('cors')())
    .use(bodyParser.urlencoded({extended: true}))
    .use(bodyParser.json())
    .use(jsonQuery())
    .use('/item', item(app))
    .use(jsonError())
}
