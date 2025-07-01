import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: NextRequest) {
  const { to, subject, text, html } = await request.json();

  // Validate required environment variables
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY is not configured');
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  if (!process.env.SENDGRID_SENDER_EMAIL) {
    console.error('SENDGRID_SENDER_EMAIL is not configured');
    return NextResponse.json({ error: 'Sender email not configured' }, { status: 500 });
  }

  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject,
      text,
      html,
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (err: unknown) {
    console.error('SendGrid error:', err);
    
    // Type guard to check if error has response property
    const sendGridError = err as { response?: { body?: { errors?: Array<{ message?: string }> } } };
    
    // Provide more specific error messages
    if (sendGridError.response?.body?.errors?.[0]?.message?.includes('Sender Identity')) {
      return NextResponse.json({ 
        error: 'Sender email not verified in SendGrid. Please verify your sender identity in SendGrid dashboard.',
        details: sendGridError.response.body.errors[0].message
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
