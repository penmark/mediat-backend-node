const EventEmitter = require('events')
const MongoClient = require('mongodb').MongoClient
const jackrabbit = require('jackrabbit')
const Promise = require('bluebird')
const winston = require('winston')
const config = require('./config')

class EventBus extends EventEmitter {
  static abort(err) {
    winston.warn('EventBus.abort', err)
    process.exit(1)
  }
}

const bus = new EventBus()
bus.on('abort', EventBus.abort)

const connectMongo = () => {
  return MongoClient.connect(config.mongoUrl)
    .catch(EventBus.abort)
}

const connectAmqp = () => {
  const rabbit = jackrabbit(config.amqpUrl)
    .on('error', EventBus.abort)
  const exchange = rabbit.direct('mediat')
  return {rabbit, exchange}
}

/**
 *
 * @returns {Promise.<{}>}
 */
const bootstrap = () => {
  return Promise.coroutine(function* () {
    const db = yield connectMongo()
    const {rabbit, exchange} = connectAmqp()
    return { db, rabbit, exchange, bus, config, abort: EventBus.abort, log: winston }
  })().catch(EventBus.abort)
}

module.exports = bootstrap
