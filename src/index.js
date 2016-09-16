const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const db = require('./db')
const item = require('./item')
const util = require('./util')


const app = express();

app.use(morgan('dev'))
    .use(bodyParser.urlencoded({extended: true}))
    .use(bodyParser.json())
    .use(util.jsonQuery())
    .use(util.errorHandler())

app.use('/item', item)

db.connect('mongodb://localhost:27017/media', (err) => {
    if (err) {
        console.log('Unable to connect to Mongo.')
        process.exit(1)
    }
    db.createIndexes('item', {title: 1, modified: -1}, (err) => {
        if (err) {
            console.log('Unable to create indexes', err)
            process.exit(2)
        }
    })
    app.listen(3000, () => {
        console.log('Listening on port 3000...')
    })
})
