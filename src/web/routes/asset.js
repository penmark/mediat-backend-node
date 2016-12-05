const Router = require('express').Router
const ObjectId = require('mongodb').ObjectId
const util = require('../../util')
const errors = require('../../errors')


module.exports = (app) => {

  function* find(req, res) {
    const asset = yield app.asset.find(
      req.jsonQuery.get('query'),
      req.jsonQuery.get('projection'),
      req.jsonQuery.get('sort'),
      req.jsonQuery.get('limit'),
      req.jsonQuery.get('skip')).toArray()
    res.send(asset)
  }

  function* findOne(req, res) {
    const asset = yield app.asset
      .byId(req._id, req.jsonQuery.get('projection'))
    if (!asset) {
      throw new errors.AssetNotFound()
    }
    res.send(asset)
  }

  function* updateOne(req, res) {
    const update = req.jsonQuery.get('update')
    update.updated_by = req.user
    update.modified = {$currentDate: true}
    const result = yield app.asset
      .updateOne(req._id, update)
    res.send({ok: result.ok})
  }

  function* thumb(req, res) {
    const image = yield app.asset
      .byId(req._id, {mimetype: 1, cover_data: 1, 'thumbs.small': 1})
      .then(asset => {
        if (!asset) {
          throw new errors.AssetNotFound()
        }
        if (asset.thumbs) {
          return asset.thumbs.small.buffer
        }
        if (asset.cover_data) {
          return asset.cover_data.buffer
        }
        res.status(204)
        return undefined
      })
    res.send(image)
  }

  function* transcode(req, res) {
    const asset = yield app.asset.byId(req._id)
    const message = {
      infile: asset.complete_name,
      outfile: `${app.config.transcodeDir}/${asset.file_name}.mp4`,
      title: req.query.title || asset.movie_name || asset.file_name,
      _id: asset._id,
      user: req.user
    }
    app.transcode(message)
    res.send({transcode: message})
  }

  const router = Router()

  router.param('_id', (req, res, next, _id) => {
    try {
      req._id = ObjectId.createFromHexString(_id)
    } catch (err) {
      err.status = 400
      next(err)
    }
    next()
  })

  router.get('/', util.wrap(find))
  router.get('/:_id', util.wrap(findOne))
  router.put('/:_id', util.wrap(updateOne))
  router.get('/:_id/thumb', util.wrap(thumb))
  router.post('/:_id/transcode', util.wrap(transcode))
  return router
}
