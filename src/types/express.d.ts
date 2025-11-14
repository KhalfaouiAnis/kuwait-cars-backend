import { UserPayload } from "@utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
      isAnonymous: boolean;
      file?: Express.Multer.File;
      query: {
        page?: string;
        pageSize?: string;
      };
    }
  }
}
