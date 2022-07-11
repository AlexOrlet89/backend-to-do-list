const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const Todo = require('../models/Todo');

module.exports = Router()
  .delete('/:id', [authenticate, authorize], async (req, res, next) => {
    try {
      const id = req.params.id;
      res.json(Todo.delete(id));
    } catch (error) {
      next(error);
    }
  })
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
      console.log('here');
      const todo = await Todo.updateById(req.params.id, req.body);
      res.json(todo);
    } catch (error) {
      next(error);
    }
  });
