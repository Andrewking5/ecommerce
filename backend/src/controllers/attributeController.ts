import { Request, Response } from 'express';
import { prisma } from '../app';
import { asyncHandler, sendErrorResponse, AppError } from '../utils/errorHandler';
import { AttributeType, CreateAttributeRequest, UpdateAttributeRequest, CreateAttributeTemplateRequest } from '../types/variant';

export class AttributeController {
  // 獲取所有屬性
  static getAttributes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { categoryId, type } = req.query;

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId as string;
    }
    if (type) {
      where.type = type as AttributeType;
    }

    const attributes = await prisma.productAttribute.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: attributes,
    });
  });

  // 獲取單個屬性
  static getAttributeById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const attribute = await prisma.productAttribute.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            variants: true,
          },
        },
      },
    });

    if (!attribute) {
      throw new AppError('Attribute not found', 404, 'ATTRIBUTE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        ...attribute,
        variantCount: attribute._count.variants,
      },
    });
  });

  // 創建屬性（管理員）
  static createAttribute = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: CreateAttributeRequest = req.body;

    // 驗證必填字段
    if (!data.name || !data.type || !data.values) {
      throw new AppError('Name, type, and values are required', 400, 'VALIDATION_ERROR');
    }

    // 驗證屬性類型
    if (!Object.values(AttributeType).includes(data.type)) {
      throw new AppError('Invalid attribute type', 400, 'VALIDATION_ERROR');
    }

    // 如果指定了分類，驗證分類是否存在
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    const attribute = await prisma.productAttribute.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        type: data.type,
        categoryId: data.categoryId || null,
        values: data.values,
        isRequired: data.isRequired ?? false,
        displayOrder: data.displayOrder ?? 0,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: attribute,
    });
  });

  // 更新屬性（管理員）
  static updateAttribute = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data: UpdateAttributeRequest = req.body;

    // 檢查屬性是否存在
    const existingAttribute = await prisma.productAttribute.findUnique({
      where: { id },
    });

    if (!existingAttribute) {
      throw new AppError('Attribute not found', 404, 'ATTRIBUTE_NOT_FOUND');
    }

    // 如果更新分類，驗證分類是否存在
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // 驗證屬性類型（如果提供）
    if (data.type && !Object.values(AttributeType).includes(data.type)) {
      throw new AppError('Invalid attribute type', 400, 'VALIDATION_ERROR');
    }

    const attribute = await prisma.productAttribute.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.type && { type: data.type }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
        ...(data.values && { values: data.values }),
        ...(data.isRequired !== undefined && { isRequired: data.isRequired }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: attribute,
    });
  });

  // 刪除屬性（管理員）
  static deleteAttribute = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // 檢查屬性是否存在
    const attribute = await prisma.productAttribute.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            variants: true,
          },
        },
      },
    });

    if (!attribute) {
      throw new AppError('Attribute not found', 404, 'ATTRIBUTE_NOT_FOUND');
    }

    // 如果屬性正在被使用，不允許刪除
    if (attribute._count.variants > 0) {
      throw new AppError(
        `Cannot delete attribute: it is being used by ${attribute._count.variants} variant(s)`,
        400,
        'ATTRIBUTE_IN_USE'
      );
    }

    await prisma.productAttribute.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Attribute deleted successfully',
    });
  });

  // 獲取屬性模板列表
  static getAttributeTemplates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { categoryId, isDefault } = req.query;

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId as string;
    }
    if (isDefault !== undefined) {
      where.isDefault = isDefault === 'true';
    }

    const templates = await prisma.productAttributeTemplate.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: templates,
    });
  });

  // 獲取單個屬性模板
  static getAttributeTemplateById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const template = await prisma.productAttributeTemplate.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!template) {
      throw new AppError('Attribute template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: template,
    });
  });

  // 創建屬性模板（管理員）
  static createAttributeTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: CreateAttributeTemplateRequest = req.body;

    // 驗證必填字段
    if (!data.name || !data.attributes) {
      throw new AppError('Name and attributes are required', 400, 'VALIDATION_ERROR');
    }

    // 如果指定了分類，驗證分類是否存在
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // 如果設置為默認模板，取消其他默認模板
    if (data.isDefault) {
      await prisma.productAttributeTemplate.updateMany({
        where: {
          ...(data.categoryId ? { categoryId: data.categoryId } : { categoryId: null }),
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await prisma.productAttributeTemplate.create({
      data: {
        name: data.name,
        categoryId: data.categoryId || null,
        attributes: data.attributes,
        isDefault: data.isDefault ?? false,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  });

  // 更新屬性模板（管理員）
  static updateAttributeTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data: Partial<CreateAttributeTemplateRequest> = req.body;

    // 檢查模板是否存在
    const existingTemplate = await prisma.productAttributeTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      throw new AppError('Attribute template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    // 如果更新分類，驗證分類是否存在
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // 如果設置為默認模板，取消其他默認模板
    if (data.isDefault) {
      await prisma.productAttributeTemplate.updateMany({
        where: {
          id: { not: id },
          ...(data.categoryId !== undefined
            ? { categoryId: data.categoryId || null }
            : { categoryId: existingTemplate.categoryId || null }),
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await prisma.productAttributeTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
        ...(data.attributes && { attributes: data.attributes }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: template,
    });
  });

  // 刪除屬性模板（管理員）
  static deleteAttributeTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // 檢查模板是否存在
    const template = await prisma.productAttributeTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new AppError('Attribute template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    await prisma.productAttributeTemplate.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Attribute template deleted successfully',
    });
  });
}

