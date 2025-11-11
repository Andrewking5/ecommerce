import { Prisma } from '@prisma/client';

// Product 类型定义（包含 category 和 reviews）
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    reviews: {
      select: {
        rating: true;
      };
    };
  };
}>;

// Product 类型定义（包含完整 reviews 和 user）
export type ProductWithFullReviews = Prisma.ProductGetPayload<{
  include: {
    category: true;
    reviews: {
      include: {
        user: {
          select: {
            firstName: true;
            lastName: true;
          };
        };
      };
    };
  };
}>;

// Review 类型定义（只包含 rating）
export type ReviewWithRating = {
  rating: number;
};

// Product 类型定义（基本，用于订单中的产品，使用 Prisma 的实际类型）
export type ProductBasic = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    price: true;
    stock: true;
  };
}>;

