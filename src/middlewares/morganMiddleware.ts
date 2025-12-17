import morgan, { StreamOptions } from 'morgan';
import Logger from '@libs/logger.js';
import { config } from '@config/environment.js';

const stream: StreamOptions = {
  write: (message) => Logger.http(message),
};

const skip = () => {
  return config.env !== 'development';
};

const morganMiddleware = morgan(
  ':method :url :res[content-type] :status :res[content-length] - :response-time ms',
  { stream, skip },
);

export default morganMiddleware;
