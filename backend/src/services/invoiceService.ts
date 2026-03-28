import PDFDocument from 'pdfkit';

// Built-in i18n labels for invoice (avoids needing i18n middleware in service)
const LABELS: Record<string, Record<string, string>> = {
  en: {
    invoice: 'INVOICE',
    date: 'Date',
    orderNumber: 'Order #',
    billTo: 'Bill To',
    item: 'Item',
    qty: 'Qty',
    unitPrice: 'Unit Price',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Discount',
    coupon: 'Coupon',
    shipping: 'Shipping',
    tax: 'Tax',
    grandTotal: 'Grand Total',
    paymentMethod: 'Payment Method',
    thankYou: 'Thank you for your purchase!',
    footer: 'Ayers Guitars — Handcrafted since 1996',
    free: 'Free',
  },
  'zh-TW': {
    invoice: '發票',
    date: '日期',
    orderNumber: '訂單編號',
    billTo: '購買人',
    item: '品項',
    qty: '數量',
    unitPrice: '單價',
    total: '小計',
    subtotal: '商品總額',
    discount: '折扣',
    coupon: '優惠券',
    shipping: '運費',
    tax: '稅金',
    grandTotal: '總計',
    paymentMethod: '付款方式',
    thankYou: '感謝您的購買！',
    footer: 'Ayers Guitars — 自1996年手工打造',
    free: '免運',
  },
  'zh-CN': {
    invoice: '发票',
    date: '日期',
    orderNumber: '订单编号',
    billTo: '购买人',
    item: '品项',
    qty: '数量',
    unitPrice: '单价',
    total: '小计',
    subtotal: '商品总额',
    discount: '折扣',
    coupon: '优惠券',
    shipping: '运费',
    tax: '税金',
    grandTotal: '总计',
    paymentMethod: '付款方式',
    thankYou: '感谢您的购买！',
    footer: 'Ayers Guitars — 自1996年手工打造',
    free: '免运',
  },
  ja: {
    invoice: '請求書',
    date: '日付',
    orderNumber: '注文番号',
    billTo: '請求先',
    item: '商品',
    qty: '数量',
    unitPrice: '単価',
    total: '小計',
    subtotal: '商品合計',
    discount: '割引',
    coupon: 'クーポン',
    shipping: '送料',
    tax: '税金',
    grandTotal: '合計',
    paymentMethod: '支払方法',
    thankYou: 'ご購入ありがとうございます！',
    footer: 'Ayers Guitars — 1996年以来ハンドクラフト',
    free: '無料',
  },
  vi: {
    invoice: 'HÓA ĐƠN',
    date: 'Ngày',
    orderNumber: 'Mã đơn hàng',
    billTo: 'Người mua',
    item: 'Sản phẩm',
    qty: 'SL',
    unitPrice: 'Đơn giá',
    total: 'Thành tiền',
    subtotal: 'Tạm tính',
    discount: 'Giảm giá',
    coupon: 'Mã giảm',
    shipping: 'Phí ship',
    tax: 'Thuế',
    grandTotal: 'Tổng cộng',
    paymentMethod: 'Phương thức thanh toán',
    thankYou: 'Cảm ơn bạn đã mua hàng!',
    footer: 'Ayers Guitars — Thủ công từ năm 1996',
    free: 'Miễn phí',
  },
};

function getLabels(lang: string) {
  return LABELS[lang] || LABELS.en;
}

interface InvoiceOrder {
  id: string;
  totalAmount: any;
  shippingCost: any;
  taxAmount: any;
  discountAmount: any;
  couponCode: string | null;
  shippingAddress: any;
  paymentMethod: string;
  createdAt: Date;
  user: { firstName: string; lastName: string; email: string; preferredLanguage?: string | null } | null;
  orderItems: Array<{
    quantity: number;
    price: any;
    product: { name: string };
  }>;
}

export class InvoiceService {
  static generateInvoice(order: InvoiceOrder, language: string): PDFKit.PDFDocument {
    const L = getLabels(language);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const GOLD = '#C8A96E';
    const DARK = '#1a1714';

    // ── Header ──────────────────────────────────────
    doc.fontSize(24).fillColor(DARK).text('AYERS GUITARS', 50, 50);
    doc.fontSize(8).fillColor('#999').text('Handcrafted Acoustic Guitars Since 1996', 50, 78);

    // Invoice title right-aligned
    doc.fontSize(20).fillColor(GOLD).text(L.invoice, 400, 50, { align: 'right' });

    // Order info
    const orderNum = order.id.substring(0, 8).toUpperCase();
    doc.fontSize(9).fillColor('#666');
    doc.text(`${L.orderNumber}: ${orderNum}`, 400, 78, { align: 'right' });
    doc.text(`${L.date}: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 92, { align: 'right' });

    // Gold divider
    doc.moveTo(50, 115).lineTo(545, 115).strokeColor(GOLD).lineWidth(1).stroke();

    // ── Bill To ─────────────────────────────────────
    doc.fontSize(10).fillColor(GOLD).text(L.billTo, 50, 130);
    doc.fontSize(9).fillColor(DARK);

    const userName = order.user ? `${order.user.firstName} ${order.user.lastName}` : 'N/A';
    const userEmail = order.user?.email || '';
    doc.text(userName, 50, 148);
    doc.text(userEmail, 50, 162);

    const addr = order.shippingAddress;
    if (addr && typeof addr === 'object') {
      const addrLine = [addr.address, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ');
      doc.text(addrLine, 50, 176, { width: 250 });
    }

    // ── Items Table ─────────────────────────────────
    let y = 220;

    // Table header
    doc.rect(50, y, 495, 22).fill('#f5f3ef');
    doc.fontSize(8).fillColor(GOLD);
    doc.text(L.item, 55, y + 7, { width: 250 });
    doc.text(L.qty, 310, y + 7, { width: 50, align: 'center' });
    doc.text(L.unitPrice, 370, y + 7, { width: 80, align: 'right' });
    doc.text(L.total, 460, y + 7, { width: 80, align: 'right' });

    y += 28;

    // Table rows
    doc.fillColor(DARK).fontSize(9);
    for (const item of order.orderItems) {
      const lineTotal = Number(item.price) * item.quantity;

      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(item.product.name, 55, y, { width: 250 });
      doc.text(String(item.quantity), 310, y, { width: 50, align: 'center' });
      doc.text(`NT$${Number(item.price).toLocaleString()}`, 370, y, { width: 80, align: 'right' });
      doc.text(`NT$${lineTotal.toLocaleString()}`, 460, y, { width: 80, align: 'right' });

      y += 20;

      // Light separator
      doc.moveTo(55, y - 4).lineTo(540, y - 4).strokeColor('#eee').lineWidth(0.5).stroke();
    }

    // ── Totals ──────────────────────────────────────
    y += 10;
    doc.moveTo(350, y).lineTo(545, y).strokeColor(GOLD).lineWidth(0.5).stroke();
    y += 10;

    const subtotal = order.orderItems.reduce((sum: number, item: any) => sum + Number(item.price) * item.quantity, 0);

    const drawTotalLine = (label: string, value: string, bold = false) => {
      doc.fontSize(bold ? 11 : 9).fillColor(bold ? DARK : '#666');
      doc.text(label, 350, y, { width: 100, align: 'right' });
      doc.fillColor(bold ? DARK : DARK);
      if (bold) doc.fontSize(12);
      doc.text(value, 460, y, { width: 80, align: 'right' });
      y += bold ? 22 : 18;
    };

    drawTotalLine(L.subtotal, `NT$${subtotal.toLocaleString()}`);

    if (order.discountAmount && Number(order.discountAmount) > 0) {
      drawTotalLine(`${L.discount}${order.couponCode ? ` (${order.couponCode})` : ''}`, `-NT$${Number(order.discountAmount).toLocaleString()}`);
    }

    const shipping = Number(order.shippingCost || 0);
    drawTotalLine(L.shipping, shipping === 0 ? L.free : `NT$${shipping.toLocaleString()}`);

    if (order.taxAmount && Number(order.taxAmount) > 0) {
      drawTotalLine(L.tax, `NT$${Number(order.taxAmount).toLocaleString()}`);
    }

    // Gold divider before grand total
    doc.moveTo(350, y).lineTo(545, y).strokeColor(GOLD).lineWidth(1).stroke();
    y += 8;
    drawTotalLine(L.grandTotal, `NT$${Number(order.totalAmount).toLocaleString()}`, true);

    // ── Payment Method ──────────────────────────────
    y += 10;
    doc.fontSize(9).fillColor('#666');
    doc.text(`${L.paymentMethod}: ${order.paymentMethod || 'Stripe'}`, 50, y);

    // ── Footer ──────────────────────────────────────
    const footerY = 760;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#ddd').lineWidth(0.5).stroke();
    doc.fontSize(10).fillColor(GOLD).text(L.thankYou, 50, footerY + 12, { align: 'center', width: 495 });
    doc.fontSize(7).fillColor('#999').text(L.footer, 50, footerY + 28, { align: 'center', width: 495 });

    return doc;
  }
}
