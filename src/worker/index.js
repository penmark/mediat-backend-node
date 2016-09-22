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
    const info = msg
    this.log.info('handle transcode', info)
    const transcoder = ffmpeg.transcode(info.infile, info.outfile)
    const subscription = rx.Observable.fromEvent(transcoder, 'progress')
      .debounceTime(500)
      .subscribe(progress => {
        const message = {progress: progress, info}
        this.app.publish('transcode.progress', message)
      })
    transcoder.on('exit', code => {
      info.success = code === 0
      this.log.info('transcode done', info)
      if (info.success) {
        this.app.ingest(info)
      }
      ack()
      subscription.unsubscribe()
    })
    transcoder.on('error', err => {
      this.log.warn('transcode', err)
    })
  }

  handleIngest(msg, ack, nack) {
    const info = msg
    this.log.info('handle ingest', info)
    const ingest = spawn(this.config.ingest, ['-d', this.config.mongoUrl, '-c', 'item', info.outfile])
    ingest.stderr.on('data', data => this.log.warn('ingest', data.toString()))
    ingest.stdout.on('data', data => this.log.info('ingest', data.toString()))
    ingest.on('exit', code => {
      info.success = code === 0
      this.log.info('ingest done', info)
      this.app.publish('ingest.progress', info)
      info.success ? ack() : nack()
    })
  }
}

const config = require('../config')
const start = () => {
  bootstrap().then(deps => new Worker(deps))
}
throng(config.numworkers, start)
