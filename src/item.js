const db = require('./db')
const Promise = require('bluebird')
const Router = require('express').Router
const ObjectId = require('mongodb').ObjectId
const util = require('./util')

const notFound = new Error('Not found')
notFound.status = 404

function* find(req, res, next) {
  const items = yield db.collection('item').find(req.jsonQuery.get('query'))
    .project(req.jsonQuery.get('projection'))
    .sort(req.jsonQuery.get('sort'))
    .limit(req.jsonQuery.get('limit') || 0)
    .skip(req.jsonQuery.get('skip') || 0)
    .toArray()
  res.send(items)
}

function* findOne(req, res, next) {
  const item = yield db.collection('item')
    .findOne({_id: req._id}, req.jsonQuery.projection)

  if (!item) {
    throw notFound
  }
  res.send(item)
}

function* updateOne(req, res, next) {
  const item = yield db.collection('item')
    .updateOne({_id: req._id}, req.jsonQuery.update)
  res.send({ok: result.ok})
}

function* thumb(req, res, next) {
  const image = yield db.collection('item')
    .findOne({_id: req._id}, {mimetype: 1, cover_data: 1, 'thumbs.small': 1})
    .then(item => {
      if (!item) {
        throw notFound
      }
      if (item.thumbs) {
        return item.thumbs.small.buffer
      }
      if (item.cover_data) {
        return item.cover_data.buffer
      }
      return undefined
    })
  if (!image) {
    res.status(204)
  }
  res.send(image)
}

const router = Router()

router.param('_id', (req, res, next, _id) => {
  try {
    req._id = ObjectId.createFromHexString(_id)
  } catch (err) {
    err.status = 400
    next(err)
  }
  next();
})

router.get('/', util.wrap(find))
router.get('/:_id', util.wrap(findOne))
router.put('/:_id', util.wrap(updateOne))
router.get('/thumb/:_id', util.wrap(thumb))

module.exports = router
