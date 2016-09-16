const MongoClient = require('mongodb').MongoClient

const state = {
    db: null,
}

exports.connect = (url, done) => {
    if (state.db) return done()

    MongoClient.connect(url, (err, db) => {
        if (err) return done(err)
        state.db = db
        done()
    })
}

exports.collection = (collection) => {
    return state.db.collection(collection)
}

exports.close = (done) => {
    if (state.db) {
        state.db.close((err, result) => {
            state.db = null
            done(err)
        })
    }
}

exports.createIndexes = (collection, indexes, done) => {
    state.db.collection(collection)
        .createIndexes(indexes, {background: true}, (err) => {
            if (err) {
                return done(err)
            }
            done()
        })
    
}
