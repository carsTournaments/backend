import { User, UserCreateDto } from '@user';
import { users } from '@testing/mocks/models.mock';
import { api } from '@testing/helpers/app.helper';
import { bodyGetAll } from '@testing/mocks/body.mock';
import { getAllFromUsers } from '@testing/helpers/helpers';
import mongoose from 'mongoose';

describe('User', () => {
  beforeEach(async () => {
    await User.deleteMany({}).exec();
    for (const user of users) {
      const item = new User(user);
      await item.save();
    }
  });

  describe('Get all users', () => {
    test('users and pagination', async () => {
      const response = await api.post('/users/getAll').send(bodyGetAll);

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(users.length);
    });

    test('tournaments and pagination', async () => {
      const { items } = await getAllFromUsers();
      expect(items).toHaveLength(users.length);
    });

    test('the first user status is ADMIN', async () => {
      const { roles } = await getAllFromUsers();
      expect(roles).toContain('ADMIN');
    });

    test('the second user status is USER', async () => {
      const { roles } = await getAllFromUsers();
      expect(roles).toContain('USER');
    });
  });

  describe('Get one user', () => {
    test('get a valid user', async () => {
      const { items } = await getAllFromUsers();
      const id = items[1]._id.toString();
      await api
        .post('/users/one')
        .send({ id })
        .expect(200)
        .expect('Content-type', /application\/json/);
    });

    test('get a not valid user', async () => {
      await api.post('/users/one').send({ id: '1' }).expect(400);
    });
  });

    describe('Get resume', () => {
      test('getResume', async () => {
        await api.post('/users/getResume').expect(200);
      });
    });

  describe('Create user', () => {
    test('a valid user be added', async () => {
      const newUser: UserCreateDto = {
        name: 'Prueba23',
        email: 'perro@perrete.es',
        password: 'perro',
        country: 'es',
        role: 'USER',
      };
      await api.post('/users/create').send(newUser).expect(200);
      const { items } = await getAllFromUsers();
      expect(items).toHaveLength(users.length + 1);
    });

    test('a not valid user be added', async () => {
      const newUser = {
        name: 'Prueba23',
        password: 'perro',
        country: 'es',
        role: 'USER',
      };
      await api.post('/users/create').send(newUser).expect(400);
    });
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
