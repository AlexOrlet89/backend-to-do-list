const pool = require('../utils/pool');

module.exports = class Todo {
  id;
  task;
  is_completed;
  user_id;

  constructor(row) {
    this.id = row.id;
    this.task = row.task;
    this.is_completed = row.is_completed;
    this.user_id = row.user_id;
  }

  static async insert({ task, is_completed, user_id }) {
    const { rows } = await pool.query(
      'INSERT INTO todos (task, is_completed, user_id) VALUES ($1,$2, $3) RETURNING *',
      [task, is_completed, user_id]
    );

    return new Todo(rows[0]);
  }

  static async delete(id) {
    const { rows } = await pool.query(
      'DELETE FROM todos WHERE id = $1 RETURNING *',
      [id]
    );
    console.log(rows);
    return new Todo(rows[0]);
  }

  static async updateById(id, attrs) {
    const todo = await Todo.getById(id);
    if (!todo) return null;
    const { task, is_completed } = { ...todo, ...attrs };
    const { rows } = await pool.query(
      'UPDATE todos SET task=$2, is_completed=$3 where id=$1 Returning *',
      [id, task, is_completed]
    );
    return new Todo(rows[0]);
  }
  static async getAll(user_id) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM todos WHERE user_id = $1',
        [user_id]
      );
      console.log('here', rows);
      return rows.map((todo) => new Todo(todo));
    } catch (error) {
      console.log(error);
    }
  }

  static async getById(id) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM todos
      WHERE id=$1
      `,
      [id]
    );
    if (!rows[0]) {
      return null;
    }
    return new Todo(rows[0]);
  }
};
