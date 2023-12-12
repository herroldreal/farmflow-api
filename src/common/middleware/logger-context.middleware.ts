/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth as Auth } from 'firebase-admin';
import { PinoLogger } from 'nestjs-pino';

import { AuthService } from '../../auth';

@Injectable()
export class LoggerContextMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: PinoLogger,
    private auth: AuthService,
  ) {}

  public async use(req: Request, _res: Response, next: () => void): Promise<void> {
    this.logger.info(`========================================================`);
    this.logger.info(`Request => ${JSON.stringify(req.user, null, 2)}`);
    this.logger.info(`========================================================`);

    const authorization: string | undefined = req.header('authorization');

    let user: Auth.DecodedIdToken;
    if (authorization?.startsWith('Bearer')) {
      const token = authorization.split(' ')[1];
      user = await this.auth.getPayload(token);
      this.logger.info(`Token => ${token}`);
    } else {
      // @ts-expect-error
      user = req.user;
    }

    this.logger.info(`User => ${JSON.stringify(user, null, 2)}`);
    this.logger.info(`========================================================`);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (user) {
      const { uid } = user;
      // for https://github.com/iamolegga/nestjs-pino/issues/608
      req.customProps = { uid };
      // Add extra fields to share in logger context
      this.logger.assign(req.customProps);
    }

    next();
  }
}
