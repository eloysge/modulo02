import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import path from 'path';
import cors from 'cors';
import sentryConfig from './config/sentry';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(
      '/gobarber/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use('/gobarber', routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const { error } = await new Youch(err, req).toJSON();
        return res.status(500).json(error);
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    });
  }
}

export default new App().server;
