import app from '../../app';
import supertest from 'supertest';

describe('Default Controller', () => {
  test('GET /', async () => {
    const response = await supertest(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({ message: 'Api de CarTournaments!' });
  });
});
