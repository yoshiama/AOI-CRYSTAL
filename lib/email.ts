import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: Array<{ name: string; qty: number; price: number; options?: string }>;
  total: number;
  status: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const itemsList = data.items.map(i =>
    `<tr><td style="padding:8px;border-bottom:1px solid #f0e6f0;">${i.name}${i.options ? ` (${i.options})` : ''}</td><td style="padding:8px;border-bottom:1px solid #f0e6f0;">${i.qty}</td><td style="padding:8px;border-bottom:1px solid #f0e6f0;">€${i.price.toFixed(2)}</td></tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#c084fc,#f472b6);padding:30px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">✨ AOI Crystal</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Accesorios con alma</p>
      </div>
      <div style="padding:30px">
        <h2 style="color:#7c3aed">¡Hola, ${data.customerName}! 💜</h2>
        <p style="color:#555">Tu pedido <strong>#${data.orderNumber}</strong> ha sido <strong>confirmado</strong>. Ya estamos preparando tu encargo con mucho cariño.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead><tr style="background:#f5f0ff"><th style="padding:10px;text-align:left">Producto</th><th style="padding:10px">Cant.</th><th style="padding:10px">Precio</th></tr></thead>
          <tbody>${itemsList}</tbody>
        </table>
        <div style="text-align:right;font-size:18px;font-weight:bold;color:#7c3aed">Total: €${data.total.toFixed(2)}</div>
        <hr style="border:none;border-top:1px solid #f0e6f0;margin:20px 0">
        <p style="color:#888;font-size:14px">Si tienes cualquier duda, escríbenos a <a href="mailto:aoicrystalor@gmail.com" style="color:#c084fc">aoicrystalor@gmail.com</a></p>
        <p style="color:#c084fc;text-align:center;margin-top:20px">✨ Gracias por confiar en AOI Crystal ✨</p>
      </div>
    </div>
  `;

  if (!process.env.SMTP_USER) return; // skip if not configured
  await transporter.sendMail({
    from: `"AOI Crystal ✨" <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `✨ Pedido #${data.orderNumber} confirmado - AOI Crystal`,
    html,
  });
}

export async function sendShippedEmail(data: OrderEmailData) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#c084fc,#f472b6);padding:30px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">✨ AOI Crystal</h1>
      </div>
      <div style="padding:30px">
        <h2 style="color:#7c3aed">¡Tu pedido está en camino! 📦</h2>
        <p style="color:#555">Hola <strong>${data.customerName}</strong>, tu pedido <strong>#${data.orderNumber}</strong> ha sido enviado y pronto llegará a tus manos.</p>
        <p style="color:#888;font-size:14px">Contacta con nosotros en <a href="mailto:aoicrystalor@gmail.com" style="color:#c084fc">aoicrystalor@gmail.com</a> si tienes alguna pregunta.</p>
        <p style="color:#c084fc;text-align:center;margin-top:20px">✨ ¡Esperamos que te encante! ✨</p>
      </div>
    </div>
  `;

  if (!process.env.SMTP_USER) return;
  await transporter.sendMail({
    from: `"AOI Crystal ✨" <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `📦 Pedido #${data.orderNumber} enviado - AOI Crystal`,
    html,
  });
}

export async function sendCancelledEmail(data: OrderEmailData) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
      <div style="background:linear-gradient(135deg,#c084fc,#f472b6);padding:30px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">✨ AOI Crystal</h1>
      </div>
      <div style="padding:30px">
        <h2 style="color:#7c3aed">Pedido cancelado</h2>
        <p style="color:#555">Hola <strong>${data.customerName}</strong>, lamentamos informarte que tu pedido <strong>#${data.orderNumber}</strong> ha sido cancelado.</p>
        <p style="color:#888;font-size:14px">Si crees que es un error, escríbenos a <a href="mailto:aoicrystalor@gmail.com" style="color:#c084fc">aoicrystalor@gmail.com</a></p>
      </div>
    </div>
  `;

  if (!process.env.SMTP_USER) return;
  await transporter.sendMail({
    from: `"AOI Crystal ✨" <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `Pedido #${data.orderNumber} cancelado - AOI Crystal`,
    html,
  });
}
