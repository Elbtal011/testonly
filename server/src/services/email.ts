import nodemailer from 'nodemailer';
import { config } from '../config';

// Email sending interface
interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  trackingId?: string;
}

// Create a transporter
let transporter: nodemailer.Transporter;

// Initialize the email service
export function initEmailService(): void {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.auth.user,
      pass: config.email.auth.pass
    }
  });
  
  // Verify the connection
  transporter.verify((error) => {
    if (error) {
      console.error('Email service connection error:', error);
    } else {
      console.log('Email service is ready to send messages');
    }
  });
}

// Send a single email
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!transporter) {
      initEmailService();
    }
    
    const { to, from, subject, text, html } = options;
    
    await transporter.sendMail({
      from: from || config.email.defaultFrom,
      to,
      subject,
      text,
      html
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Send a campaign email with tracking
export async function sendCampaignEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!options.trackingId) {
      return sendEmail(options);
    }
    
    // Add tracking pixels and link tracking to HTML content
    const trackedHtml = addTracking(options.html, options.trackingId);
    
    return sendEmail({
      ...options,
      html: trackedHtml
    });
  } catch (error) {
    console.error('Error sending campaign email:', error);
    return false;
  }
}

// Add tracking to email HTML
function addTracking(html: string, trackingId: string): string {
  // Add tracking pixel
  const trackingPixel = `<img src="${getApiUrl()}/api/track/open/${trackingId}" width="1" height="1" alt="" style="display:none">`;
  
  // Add to the end of the HTML body
  let trackedHtml = html.replace('</body>', `${trackingPixel}</body>`);
  
  // Track links
  trackedHtml = trackLinks(trackedHtml, trackingId);
  
  return trackedHtml;
}

// Track links in the email
function trackLinks(html: string, trackingId: string): string {
  // Find all links in the HTML
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
  
  // Replace each link with a tracked version
  return html.replace(linkRegex, (match, quote, url) => {
    // Don't track mailto: links or anchors
    if (url.startsWith('mailto:') || url.startsWith('#')) {
      return match;
    }
    
    // Create a tracked URL
    const trackedUrl = `${getApiUrl()}/api/track/click/${trackingId}?url=${encodeURIComponent(url)}`;
    
    return `<a href=${quote}${trackedUrl}${quote}`;
  });
}

// Get the API URL
function getApiUrl(): string {
  const apiUrl = process.env.API_URL || 'http://localhost:3001';
  return apiUrl;
}

export default {
  initEmailService,
  sendEmail,
  sendCampaignEmail
};
