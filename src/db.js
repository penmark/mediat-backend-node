const MongoClient = require('mongodb').MongoClient

const state = {
  db: null
}

exports.connect = (url) => {
  if (state.db) {
    return new Promise((resolve) => {
      resolve(state.db)
    })
  }
  return MongoClient
    .connect(url)
    .then(db => state.db = db)
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


exports.createIndexesA = (collection, indexes) => {
  return state.db.collection(collection)
    .createIndexes(indexes)
}
