const Router = require('express').Router
const ObjectId = require('mongodb').ObjectId
const util = require('../../util')
const errors = require('../../errors')


module.exports = (app) => {

  function* find(req, res) {

    const items = yield app.item.find(
      req.jsonQuery.get('query'),
      req.jsonQuery.get('projection'),
      req.jsonQuery.get('sort'),
      req.jsonQuery.get('limit'),
      req.jsonQuery.get('skip')).toArray()
    res.send(items)
  }

  function* findOne(req, res) {

    const item = yield app.item
      .byId(req._id, req.jsonQuery.get('projection'))
    if (!item) {
      throw new errors.ItemNotFound()
    }
    res.send(item)
  }

  function* updateOne(req, res) {
    const result = yield app.item
      .updateOne(req._id, req.jsonQuery.get('update'))
    res.send({ok: result.ok})
  }

  function* thumb(req, res) {
    const image = yield app.item
      .byId(req._id, {mimetype: 1, cover_data: 1, 'thumbs.small': 1})
      .then(item => {
        if (item.thumbs) {
          return item.thumbs.small.buffer
        }
        if (item.cover_data) {
          return item.cover_data.buffer
        }
        res.status(204)
        return undefined
      })
    res.send(image)
  }

  function* transcode(req, res, next) {
    const item = yield app.item.byId(req._id)
    const message = {
      infile: item.complete_name,
      outfile: `${app.config.transcodeDir}/${item.file_name}.mp4`,
      title: req.query.title || item.movie_name || item.file_name,
      _id: req._id
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
