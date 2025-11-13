// src/example/index.ts
import { http } from '@google-cloud/functions-framework';
import type { Request, Response } from 'express';
import { createGreeting } from '~/shared/utils/greeting';

/**
 * HTTP Cloud Function.
 *
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 */
http('example', (req: Request, res: Response) => {
  const name = req.query.name || req.body.name || 'World';
  const message = createGreeting(name as string);
  res.status(200).send(message);
});
