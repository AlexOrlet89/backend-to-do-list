const Todo = require('../models/Todo');

module.exports = async (req, res, next) => {
  // TODO: Check req.user to ensure the user's email is 'admin'
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
