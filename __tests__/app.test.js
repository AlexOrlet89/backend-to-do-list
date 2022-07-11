const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const mockUser = {
  email: 'test@example.com',
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

  it.only('should create a new todo for the authenticated user', async () => {
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

  afterAll(() => {
    pool.end();
  });
});
