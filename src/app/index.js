
class App {
  constructor(deps) {
    this.db = deps.db
    this.config = deps.config
    this.channel = deps.channel
    this.bus = deps.bus
    this.wss = deps.wss
    this.exchange = deps.config.exchange
    this.bindQueue('transcode.progress')
      .then(q => this.channel.consume(q.queue, this.transcodeProgress.bind(this), {noAck: true}))
    this.bindQueue('ingest.progress')
      .then(q => this.channel.consume(q.queue, this.ingestProgress.bind(this), {noAck: true}))
  }

  bindQueue(name) {
    return this.channel.assertQueue(name)
      .then(q => this.channel.bindQueue(q.queue, this.exchange, name))
  }
  transcode(msg) {
    this.publish('transcode', msg)
  }

  transcodeProgress(msg) {
    const data = JSON.parse(msg.content)
    const message = {
      type: 'progress',
      payload: {
        progress: data.progress,
        _id: data._id,
        user: data.user
      }
    }
    this.wsBroadcast(message)
  }

  wsBroadcast(msg) {
    this.bus.emit('wsBroadcast', msg)
  }

  ingest(msg) {
    this.publish('ingest', msg)
  }

  ingestProgress(msg) {
    const data = JSON.parse(msg.content)
    this.wsBroadcast(data)
  }

  publish(queue, msg) {
    this.channel.publish(this.exchange, queue, Buffer.from(JSON.stringify(msg)))
  }

  ack(msg) {
    this.channel.ack(msg)
  }

  get item() {
    if (!this._item) {
      this._item = require('./item')(this.db)
    }
    return this._item
  }
}

module.exports = App
