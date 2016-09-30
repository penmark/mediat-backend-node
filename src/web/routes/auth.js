const Router = require('express').Router

module.exports = (app) => {
  const router = new Router();

  router.get('/', (req, res, next) => {
    if (req.user) {
      res.status(200).send({user: req.user})
    }
    res.status(401).send({message: 'Please re-authenticate'})
  })
  return router
}
