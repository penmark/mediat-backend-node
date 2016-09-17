const bodyParser = require('body-parser')
const express = require('express')
const Server = require('http').Server
const morgan = require('morgan')
const db = require('./db')
const item = require('./item')
const util = require('./util')
const WsServer = require('ws').Server

const port = +process.env.PORT || 3000;
const production = process.env.NODE_ENV === 'production'
const host = production ? '::1' : '::'

const app = express();
const server = Server(app);
const wss = new WsServer({server})

app.use(morgan('dev'))
  .use(bodyParser.urlencoded({extended: true}))
  .use(bodyParser.json())
  .use(util.jsonQuery())
  .use(util.errorHandler())

app.use('/item', item)

db.connect('mongodb://localhost:27017/media')
  .then(db => {
    server.listen(port, host, () => {
      console.log(`Listening on ${host}:${port}`)
    })
  })
  .catch(err => {
    console.log('Unable to connect to Mongo:', err)
    process.exit(1)
  })

wss.on('connection', (ws) => {

  ws.send(JSON.stringify({message: 'hello'}))

  ws.on('message', (msg) => {
    const message = JSON.parse(msg)
    console.log('message', message)
  })
})
