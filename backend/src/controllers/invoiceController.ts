import { Request, Response } from 'express';
import { prisma } from '../app';
import { InvoiceService } from '../services/invoiceService';

export class InvoiceController {
  /**
   * 下載訂單發票 PDF
   * GET /api/orders/:id/invoice
   */
  static async getInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      // Owner or admin can access
      const order = await prisma.order.findFirst({
        where: userRole === 'ADMIN' ? { id } : { id, userId },
        include: {
          orderItems: {
            include: {
              product: { select: { name: true } },
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              preferredLanguage: true,
            },
          },
          payments: true,
        },
      });

      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }

      const language = order.user?.preferredLanguage || 'en';
      const doc = InvoiceService.generateInvoice(order, language);

      const orderNum = order.id.substring(0, 8).toUpperCase();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderNum}.pdf"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate invoice' });
    }
  }
}
