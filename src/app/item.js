
module.exports = (db) => {
  const item = db.collection('item')
  return {
    find: (query, projection, sort, limit, skip) => {
      return item.find(query)
        .project(projection)
        .sort(sort)
        .limit(limit || 0)
        .skip(skip || 0)
    },
    byId: (id, projection) => {
      return item.findOne({_id: id}, projection)
    },
    findOne: (query, projection) => {
      return item.findOne(query, projection)
    },
    updateOne: (id, update) => {
      return item.updateOne({_id: id}, update)
    }
  }
}
