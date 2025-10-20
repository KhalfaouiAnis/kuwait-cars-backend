import { UserPayload } from '@utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      file?: Express.Multer.File;
      // params: {};
      query: {
        page?: string;
        pageSize?: string;
      };
    }
  }
}
