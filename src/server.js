const bootstrap = require('./bootstrap')
const http = require('http')
const ws = require('ws')
const throng = require('throng')
const App = require('./app')
const web = require('./web')

class Server {
  constructor(deps) {
    this.app = new App(deps)
    this.bus = deps.bus
    this.server = http.createServer(web(this.app, deps.config))
    this.log = deps.log
    this.wss = new ws.Server({server: this.server})
    this.wss.on('connection', (conn) => {
      conn.send(JSON.stringify({message: 'Hello'}))
    })
    process.once('SIGTERM', () => this.shutdown())
    this.bus.removeListener('abort', deps.abort)
    this.bus.on('abort', this.shutdown.bind(this))
    this.bus.on('wsBroadcast', this.wsBroadcast.bind(this))
    this.server.listen(deps.config.port, deps.config.host, this.onListen.bind(this))
  }

  shutdown() {
    this.server.close(() => {
      this.log.info('shutdown; exiting')
      process.exit(0)
    })
  }

  wsBroadcast (msg) {
    this.wss.clients.forEach(client => {
      client.send(JSON.stringify(msg))
    })
  }

  onListen() {
    this.log.info(`Listening on ${config.host}:${config.port}`)
  }
}

const start = () => {
  bootstrap().then(deps => new Server(deps))
}
const config = require('./config')
throng(config.numservers, start)
