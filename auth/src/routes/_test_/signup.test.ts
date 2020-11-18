import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'pass1234' })
    .expect(201);
});

it('returns a 400 with invalid email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ password: 'pass1234' })
    .expect(400);
});

it('returns a 400 with invalid password and email', async () => {
  await request(app).post('/api/users/signup').send({}).expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com' })
    .expect(400);
});

it('Duplicates email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'pass1234' })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'pass1234' })
    .expect(400);
});

it('Check set cookie', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'pass1234' })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
