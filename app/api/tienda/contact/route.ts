import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json();
  if (!name || !email || !message) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });

  if (process.env.SMTP_USER) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 587, secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"AOI Crystal Web" <${process.env.SMTP_USER}>`,
      to: 'aoicrystalor@gmail.com',
      subject: `💌 Mensaje de contacto de ${name}`,
      html: `<p><b>Nombre:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Mensaje:</b><br>${message.replace(/\n/g, '<br>')}</p>`,
    });
  }

  return NextResponse.json({ success: true });
}
