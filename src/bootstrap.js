const EventEmitter = require('events')
const MongoClient = require('mongodb').MongoClient
const amqp = require('amqplib')
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
  return amqp.connect(config.amqpUrl)
    .then(conn => conn.createChannel())
    .then(ch => {
      ch.assertExchange(config.exchange, 'direct', {durable: false})
      return ch
    })
    .catch(EventBus.abort)
}

/**
 *
 * @returns {Promise.<{}>}
 */
const bootstrap = () => {
  return Promise.coroutine(function* () {
    const db = yield connectMongo()
    const channel = yield connectAmqp()
    return { db, channel, bus, config, abort: EventBus.abort, log: winston }
  })().catch(EventBus.abort)
}

module.exports = bootstrap
