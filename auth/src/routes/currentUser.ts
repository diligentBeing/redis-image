import express from 'express';

import { currentUser } from '@tixy/common';

const router = express.Router();

router.get(`/api/users/currentuser`, currentUser, (req, res) => {
  res.send({ data: { currentUser: req.currentUser || null } });
});

export { router as currentUserRouter };
