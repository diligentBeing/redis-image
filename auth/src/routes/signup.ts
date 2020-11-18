import express from 'express';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { validateRequest } from '@tixy/common';
import { User } from './../models/User';
import { RequestValidationError } from '@tixy/common';
import { BadRequestError } from '@tixy/common';

const logger = require('./../../logger');

const router = express.Router();

router.post(`/api/users/signup`, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const sf = 0;

  if (!email || !password) {
    throw new Error('Invalid email or password');
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new BadRequestError('This account exists already.');
  }

  const user = new User({ email, password });
  await user.save();

  //Generate JWT
  const userJwt = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_KEY!
  );

  //Store it on session object
  req.session = { jwt: userJwt };

  logger.log('info', `Created user ${email}`);

  res.status(201).send({
    status: 'success',
    user: user,
  });
});

export { router as signupRouter };
