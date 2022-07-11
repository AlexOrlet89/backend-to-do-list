const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const Todo = require('../lib/models/Todo');

const mockUser = {
  email: 'test@example.com',
  password: '123456',
};
const mockUser2 = {
  email: 'test2@example.com',
  password: '123456',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...mockUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });

  return [agent, user];
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('creates a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    const { email } = mockUser;
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      email,
    });
  });

  it('/me returns the current user', async () => {
    const [agent, user] = await registerAndLogin();
    const me = await agent.get('/api/v1/users/me');
    expect(me.body).toEqual({
      ...user,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it('should create a new todo for the authenticated user', async () => {
    const [agent, user] = await registerAndLogin();
    const todo = { task: 'try to take over the world', is_completed: false };
    const response = await agent.post('/api/v1/todos').send(todo);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      id: expect.any(String),
      task: todo.task,
      is_completed: todo.is_completed,
      user_id: user.id,
    });
  });

  it('should get todos associated with authenticated user', async () => {
    const [agent, user] = await registerAndLogin();
    const notUser = await UserService.create(mockUser2);

    const todo = await Todo.insert({
      task: 'try to take over the world',
      is_completed: false,
      user_id: user.id,
    });
    const todo2 = await Todo.insert({
      task: 'try to take over the moon',
      is_completed: false,
      user_id: notUser.id,
    });

    const response = await agent.get('/api/v1/todos');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([todo]);
    expect(response.body).not.toEqual([todo2]);
  });

  it.only('should update an authd users todo', async () => {
    const [agent, user] = await registerAndLogin();

    const todo = await Todo.insert({
      task: 'try to take over the world',
      is_completed: false,
      user_id: user.id,
    });

    const response = await agent
      .put(`/api/v1/todos/${todo.id}`)
      .send({ is_completed: true });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...todo, is_completed: true });
  });

  afterAll(() => {
    pool.end();
  });
});
