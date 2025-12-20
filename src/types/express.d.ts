import { UserPayload } from "@utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
      isGuest: boolean;
      query: {
        page?: string;
        pageSize?: string;
      };
    }
  }
}
