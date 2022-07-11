const { Router } = require('express');
const authenticate = require('../middleware/authenticate');

module.exports = Router().post('/', authenticate, async (req, res, next) => {
  try {
    const todo = await Todo.insert({ ...req.body, user_id: req.user.id });
    res.json(todo);
  } catch (error) {
    next(error);
  }
});
