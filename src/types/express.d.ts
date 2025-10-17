import { UserPayload } from '@utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      file?: Express.Multer.File;
      params: {
        courseId?: string;
        reviewId?: string;
        sectionId?: string;
        videoId?: string;
        enrollmentId?: string;
      };
      query: {
        page?: string;
        pageSize?: string;
        category?: string;
        featured?: string;
      };
    }
  }
}
