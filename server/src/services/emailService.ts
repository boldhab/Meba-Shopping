import { mailer } from "../config/mailer";

export const emailService = {
  async sendOrderConfirmation(order: any, userEmail: string) {
    const subject = `Order Confirmation - ${order.id}`;
    const text = `Thank you for your order! Your order ID is ${order.id}. Total amount: ${order.totalAmount}`;
    const html = `<p>Thank you for your order!</p><p>Your order ID is <strong>${order.id}</strong>.</p><p>Total amount: ${order.totalAmount}</p>`;

    await mailer.sendEmail({ to: userEmail, subject, text, html });
  },

  async sendPaymentFailed(order: any, userEmail: string) {
    const subject = `Payment Failed - ${order.id}`;
    const text = `We were unable to process payment for your order ${order.id}. Please update your payment method.`;
    const html = `<p>We were unable to process payment for your order <strong>${order.id}</strong>.</p><p>Please update your payment method.</p>`;

    await mailer.sendEmail({ to: userEmail, subject, text, html });
  },

  async sendLowStockNotification(product: any, admins: string[]) {
    const subject = `Low stock alert: ${product.name}`;
    const text = `Product ${product.name} (ID: ${product.id}) is low on stock. Remaining: ${product.stock}`;
    const html = `<p>Product <strong>${product.name}</strong> (ID: ${product.id}) is low on stock.</p><p>Remaining: ${product.stock}</p>`;

    for (const to of admins) {
      await mailer.sendEmail({ to, subject, text, html });
    }
  }
};
