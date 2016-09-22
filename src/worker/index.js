const throng = require('throng')
const App = require('../app')
const ffmpeg = require('./ffmpeg')
const spawn = require('child_process').spawn
const bootstrap = require('../bootstrap')

class Worker {
  constructor(deps) {
    this.app = new App(deps)
    this.config = deps.config
    this.channel = deps.channel
    this.log = deps.log
    this.app.bindQueue('transcode')
      .then(q => this.channel.consume(q.queue, this.handleTranscode.bind(this), {noAck: false}))
    this.app.bindQueue('ingest')
      .then(q => this.channel.consume(q.queue, this.handleIngest.bind(this), {noAck: false}))
    deps.log.info('Worker listening on transcode and ingest queues')
  }

  handleTranscode(msg) {
    const info = JSON.parse(msg.content)
    const transcoder = ffmpeg.transcode(info.infile, info.outfile)
    transcoder.on('progress', (progress) => {
      const message = {progress: progress, info}
      this.app.publish('transcode.progress', message)
    })
    transcoder.on('exit', code => {
      info.success = code === 0
      this.log.info('Transcode', info)
      if (info.success) {
        this.app.ingest(info)
      }
      this.app.ack(msg)
    })
    transcoder.on('error', err => {
      this.log.warn('Transcode', err)
    })
  }

  handleIngest(msg) {
    const info = JSON.parse(msg.content)
    const ingest = spawn(this.config.ingest, ['-d', this.config.mongoUrl, '-c', 'item', info.outfile])
    ingest.on('exit', code => {
      info.success = code === 0
      this.log.info('ingest', info)
      this.app.publish('ingest.progress', info)
      this.app.ack(msg)
    })
  }
}

const config = require('../config')
const start = () => {
  bootstrap().then(deps => new Worker(deps))
}
throng(config.numworkers, start)
