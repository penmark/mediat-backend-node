const throng = require('throng')
const App = require('../app')
const ffmpeg = require('./ffmpeg')
const spawn = require('child_process').spawn
const bootstrap = require('../bootstrap')
const rx = require('rxjs/Rx')

class Worker {
  constructor(deps) {
    this.app = new App(deps)
    this.config = deps.config
    this.log = deps.log
    this.ingestQueue = deps.exchange.queue({name: 'ingest', key: 'ingest'})
    this.ingestQueue.consume(this.handleIngest.bind(this), {noAck: false})
    this.transcodeQueue = deps.exchange.queue({name: 'transcode', key: 'transcode'})
    this.transcodeQueue.consume(this.handleTranscode.bind(this), {noAck: false})
  }

  handleTranscode(msg, ack, nack) {
    this.log.info('handle transcode', msg)
    const transcoder = ffmpeg.transcode(msg.infile, msg.outfile)
    const subscription = rx.Observable.fromEvent(transcoder, 'progress')
      .debounceTime(500)
      .map(progress => ({type: 'progress', payload: {progress, _id: msg._id, user: msg.user}}))
      .subscribe(message => {
        this.app.publish('transcode.progress', message)
      })
    transcoder.on('exit', code => {
      msg.success = code === 0
      this.log.info('transcode done', msg)
      if (msg.success) {
        this.app.ingest(msg)
      }
      ack()
      subscription.unsubscribe()
    })
    transcoder.on('error', err => {
      this.log.warn('transcode', err)
    })
  }

  handleIngest(msg, ack, nack) {
    this.log.info('handle ingest', msg)
    const ingest = spawn(this.config.ingest, ['-d', this.config.mongoUrl, '-c', 'asset', msg.outfile])
    ingest.stderr.on('data', data => this.log.warn('ingest', data.toString()))
    ingest.stdout.on('data', data => this.log.info('ingest', data.toString()))
    ingest.on('exit', code => {
      msg.success = code === 0
      this.log.info('ingest done', msg)
      const message = {
        type: 'ingest',
        payload: {success: msg.success, original_id: msg._id, user: msg.user}
      }
      this.app.publish('ingest.progress', message)
      msg.success ? ack() : nack()
    })
  }
}

const config = require('../config')
const start = () => {
  bootstrap().then(deps => new Worker(deps))
}
throng(config.numworkers, start)
