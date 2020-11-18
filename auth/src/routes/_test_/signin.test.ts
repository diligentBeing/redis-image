import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'pass1234' })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'pass1234' })
    .expect(200);
});

it('returns a 400 with invalid email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'pass1234' })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({ email: 'tet@test.com', password: 'pass1234' })
    .expect(400);
});

it('returns a 400 with invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'pass1234' })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'pss1234' })
    .expect(400);
});

it('Check set cookie', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'pass1234' })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'pass1234' })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
