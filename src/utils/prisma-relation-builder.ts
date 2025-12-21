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

export const buildSelectClose = (
  userId?: string,
  fullDetails?: boolean
): Prisma.AdSelect => {
  const select: Prisma.AdSelect = {
    id: true,
    title: true,
    description: true,
    price: true,
    year: true,
    mileage: true,
    mileage_unit: true,
    province: true,
    fuel_type: true,
    transmission: true,
    plan: true,
    created_at: true,
    media: {
      omit: {
        ad_id: true,
        created_at: true,
        id: true,
        original_url: true,
        public_id: true,
      },
    },
    favorited_by: {
      where: { id: userId },
      select: { id: true },
      take: 1,
    },
  };

  if (fullDetails) {
    select.flagged_by = {
      where: { id: userId },
      select: { id: true },
      take: 1,
    };
    select.user = {
      select: {
        id: true,
        fullname: true,
        phone: true,
        province: true,
        location: true,
        area: true,
      },
    };
  }

  return select;
};

/**
 * Formats the raw Prisma result into a clean Frontend-ready object
 */
export const formatAdInteractions = (data: any[] | any) => {
  if (Array.isArray(data)) {
    return data.map((ad) => ({
      ...ad,
      is_favorited: !!ad.favorited_by?.length,
      is_flagged: !!ad.flagged_by?.length,
      favorited_by: undefined,
      flagged_by: undefined,
    }));
  }

  return {
    ...data,
    is_favorited: !!data.favorited_by?.length,
    is_flagged: !!data.flagged_by?.length,
    favorited_by: undefined,
    flagged_by: undefined,
  };
};
