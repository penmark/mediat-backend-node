const db = require('./db')
const Promise = require('bluebird')
const Router = require('express').Router
const ObjectId = require('mongodb').ObjectId
const util = require('./util')


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
        .then(item => {
            if (!item) {
                let err = new Error('Not found')
                err.status = 404
                return next(err)
            }
            res.send(item)
        })
}

function* updateOne(req, res, next) {
    const item = yield db.collection('item')
        .updateOne({_id: req._id}, req.jsonQuery.update)
    res.send({ok: result.ok})
}

const router = Router()

router.param('_id', (req, res, next, _id) => {
    console.log('param', _id)
    try {
        req._id = ObjectId.createFromHexString(_id)
        console.log('param', req._id)
    } catch (err) {
        console.error('objectId', err)
        err.status = 400
        next(err)
    }
    next();
})

router.get('/', util.wrap(find))
router.get('/:_id', util.wrap(findOne))
router.put('/:_id', util.wrap(updateOne))

module.exports = router
