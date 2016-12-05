
module.exports = (db) => {
  const asset = db.collection('asset')
  return {
    find: (query, projection, sort, limit, skip) => {
      return asset.find(query)
        .project(projection)
        .sort(sort)
        .limit(limit || 0)
        .skip(skip || 0)
    },
    byId: (id, projection) => {
      return asset.findOne({_id: id}, projection)
    },
    findOne: (query, projection) => {
      return asset.findOne(query, projection)
    },
    updateOne: (id, update) => {
      return asset.updateOne({_id: id}, update)
    }
  }
}
