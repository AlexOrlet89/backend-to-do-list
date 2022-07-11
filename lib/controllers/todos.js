const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const Todo = require('../models/Todo');

module.exports = Router()
  .post('/', authenticate, async (req, res, next) => {
    try {
      const todo = await Todo.insert({ ...req.body, user_id: req.user.id });
      res.json(todo);
    } catch (error) {
      next(error);
    }
  })
  .get('/', authenticate, async (req, res, next) => {
    try {
      const todo = await Todo.getAll(req.user.id);
      res.send(todo);
    } catch (error) {
      next(error);
    }
  })
  .put('/:id', [authenticate, authorize], async (req, res, next) => {
    try {
      const item = await Todo.updateById(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });
