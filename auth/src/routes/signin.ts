import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { BadRequestError, validateRequest } from '@tixy/common';
import { User } from '../models/User';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';
const logger = require('./../../logger');

const router = express.Router();

router.post(
  `/api/users/signin`,
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    logger.log('info', `Signing user ${email}`);

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError(
        'Either the email or password is invalid. Invalid credentials'
      );
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordsMatch) {
      throw new BadRequestError(
        'Either the email or password is invalid. Invalid credentials'
      );
    }

    //Generate JWT
    const userJwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!
    );

    //Store it on session object
    req.session = { jwt: userJwt };

    logger.log('info', `Created user ${email}`);

    res.status(200).send({
      status: 'success',
      user: existingUser,
    });
  }
);

export { router as signinRouter };
