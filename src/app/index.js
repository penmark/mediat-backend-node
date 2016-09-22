
class App {
  constructor(deps) {
    this.db = deps.db
    this.config = deps.config
    this.channel = deps.channel
    this.bus = deps.bus
    this.wss = deps.wss
    this.exchange = deps.exchange
    this.log = deps.log

  }

  transcode(msg) {
    this.publish('transcode', msg)
  }

  wsBroadcast(msg) {
    this.bus.emit('wsBroadcast', msg)
  }

  ingest(msg) {
    this.publish('ingest', msg)
  }

  publish(key, msg) {
    this.exchange.publish(msg, {key})
  }

  get item() {
    if (!this._item) {
      this._item = require('./item')(this.db)
    }
    return this._item
  }
}

module.exports = App
