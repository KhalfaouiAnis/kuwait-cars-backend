import { UserPayload } from "@utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
      isAnonymous: boolean;
      query: {
        page?: string;
        pageSize?: string;
      };
    }
  }
}
