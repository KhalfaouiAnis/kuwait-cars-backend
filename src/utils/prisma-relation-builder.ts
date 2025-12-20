import { Prisma } from "generated/prisma/client.js";

export const buildAdInteractions = (userId?: string): Prisma.AdInclude => {
  // If no user, we return an empty include (or just global counts)
  const include: Prisma.AdInclude = {
    user: {
      omit: {
        password: true,
        created_at: true,
        updated_at: true,
        apple_id: true,
        google_id: true,
        facebook_id: true,
        role: true,
      },
    },
    media: {
      select: {
        original_url: true,
        transformed_url: true,
        media_type: true,
        public_id: true,
      },
    },
  };

  if (!userId) {
    return include;
  }

  return {
    ...include,
    favorited_by: {
      where: { id: userId },
      select: { id: true },
      take: 1,
    },
    flagged_by: {
      where: { id: userId },
      select: { id: true },
      take: 1,
    },
  };
};

/**
 * Formats the raw Prisma result into a clean Frontend-ready object
 */
export const formatAdInteractions = (ads: any[]) => {
  return ads.map((ad) => ({
    ...ad,
    is_favorited: !!ad.favorited_by?.length,
    is_flagged: !!ad.flagged_by?.length,
    favorited_by: undefined,
    flagged_by: undefined,
  }));
};
