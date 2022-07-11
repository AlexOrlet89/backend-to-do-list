const Todo = require('../models/Todo');

module.exports = async (req, res, next) => {
  try {
    const todo = await Todo.getById(req.params.id);
    if (!todo || todo.user_id !== req.user.id)
      throw new Error('That is not yours to edit or delete');

    next();
  } catch (err) {
    err.status = 403;
    next(err);
  }
};
