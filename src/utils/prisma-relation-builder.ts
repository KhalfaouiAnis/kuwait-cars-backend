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
  fullDetails?: boolean,
): Prisma.AdSelect => {
  const select: Prisma.AdSelect = {
    id: true,
    title: true,
    ad_type: true,
    ad_category: true,
    brand: true,
    model: true,
    description: true,
    price: true,
    year: true,
    mileage: true,
    mileage_unit: true,
    province: true,
    fuel_type: true,
    transmission: true,
    plan: true,
    status: true,
    created_at: true,
    views: true,
    media: {
      omit: {
        ad_id: true,
        created_at: true,
        id: true,
        original_url: true,
      },
    },
    favorited_by: {
      where: { id: userId },
      select: { id: true },
      take: 1,
    },
    user: {
      select: {
        id: true,
        fullname: true,
        avatar: {
          select: { original_url: true },
        },
      },
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
        created_at: true,
        avatar: {
          select: { original_url: true },
        },
      },
    };
    select.brand = true;
    select.model = true;
    select.contact_whatsapp = true;
    select.xcar_calls = true;
    select.xcar_chat = true;
    select.receive_calls = true;
    select.additional_number = true;
    select.second_additional_number = true;
  }

  return select;
};

export const formatAdInteractions = (data: any[] | any) => {
  if (Array.isArray(data)) {
    return data.map((ad) => ({
      ...ad,
      is_favorited: ad.favorited_by?.length > 0,
      is_flagged: ad.flagged_by?.length > 0,
      favorited_by: undefined,
      flagged_by: undefined,
    }));
  }

  return {
    ...data,
    is_favorited: data.favorited_by?.length > 0,
    is_flagged: data.flagged_by?.length > 0,
    favorited_by: undefined,
    flagged_by: undefined,
  };
};
