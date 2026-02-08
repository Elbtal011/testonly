// Email template processing service for bank-specific templates

import { BANK_EMAIL_CONFIGS, getBankConfig } from '../constants/bankEmailConfig';
import { EMAIL_VARIABLES, EMAIL_TEMPLATE_TYPES, EmailTemplateType } from '../constants/emailTemplateTypes';

export interface EmailTemplateData {
  // User data
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  
  // Bank data
  bankName?: string;
  
  // Account data
  accountNumber?: string;
  accountIban?: string;
  accountBalance?: string;
  accountType?: string;
  
  // Transaction data
  transactionId?: string;
  transactionAmount?: string;
  transactionDate?: string;
  transactionTime?: string;
  transactionDescription?: string;
  transactionRecipient?: string;
  
  // Security data
  loginIp?: string;
  loginDevice?: string;
  loginLocation?: string;
  verificationCode?: string;
  securityToken?: string;
  
  // System data
  unsubscribeLink?: string;
  privacyPolicyLink?: string;
  termsLink?: string;
  
  // Custom data
  [key: string]: any;
}

export interface ProcessedEmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  previewText: string;
  deliverabilityScore: number;
}

export class EmailTemplateService {
  
  /**
   * Process email template with bank branding and personalization
   */
  static async processTemplate(
    templateHtml: string,
    subject: string,
    bankName: string,
    templateData: EmailTemplateData = {}
  ): Promise<ProcessedEmailTemplate> {
    
    const bankConfig = getBankConfig(bankName);
    if (!bankConfig) {
      throw new Error(`Bank configuration not found for: ${bankName}`);
    }
    
    // Merge bank data with template data
    const processedData = {
      ...templateData,
      // Bank branding data
      bankName: bankConfig.displayName,
      bankDisplayName: bankConfig.displayName,
      bankPrimaryColor: bankConfig.primaryColor,
      bankSecondaryColor: bankConfig.secondaryColor,
      bankLogoUrl: bankConfig.logoUrl,
      bankFaviconUrl: bankConfig.faviconUrl,
      bankFontFamily: bankConfig.fontFamily,
      bankFontUrls: bankConfig.fontUrls,
      bankSupportEmail: bankConfig.supportEmail,
      bankSupportPhone: bankConfig.supportPhone,
      bankWebsiteUrl: bankConfig.websiteUrl,
      bankLegalName: bankConfig.legalName,
      bankAddress: bankConfig.address,
      bankSocialMedia: bankConfig.socialMedia,
      bankRegulatoryText: bankConfig.compliance.regulatoryText,
      bankDisclaimerText: bankConfig.compliance.disclaimerText,
      
      // System data
      currentDate: new Date().toLocaleDateString('de-DE'),
      currentTime: new Date().toLocaleTimeString('de-DE'),
      currentYear: new Date().getFullYear().toString(),
      privacyPolicyUrl: bankConfig.compliance.privacyPolicyUrl,
      termsOfServiceUrl: bankConfig.compliance.termsOfServiceUrl,
      unsubscribeLink: templateData.unsubscribeLink || '#unsubscribe',
      
      // User data defaults
      userEmail: templateData.email || 'kunde@example.com',
      userName: templateData.fullName || templateData.firstName || 'Kunde'
    };
    
    // Process HTML template
    let processedHtml = this.replaceVariables(templateHtml, processedData);
    let processedSubject = this.replaceVariables(subject, processedData);
    
    // Generate text version
    const textContent = this.generateTextVersion(processedHtml);
    
    // Generate preview text (first 150 characters of content)
    const previewText = this.generatePreviewText(processedHtml);
    
    // Calculate deliverability score
    const deliverabilityScore = this.calculateDeliverabilityScore(
      processedHtml,
      processedSubject,
      textContent
    );
    
    return {
      subject: processedSubject,
      htmlContent: processedHtml,
      textContent,
      previewText,
      deliverabilityScore
    };
  }
  
  /**
   * Replace template variables with actual values
   */
  private static replaceVariables(template: string, data: Record<string, any>): string {
    let result = template;
    
    // Replace {{variable}} patterns
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        result = result.replace(regex, String(value));
      }
    });
    
    // Handle Handlebars-style conditionals and loops (basic implementation)
    result = this.processConditionals(result, data);
    result = this.processLoops(result, data);
    
    // Clean up any remaining unprocessed variables
    result = result.replace(/{{[^}]+}}/g, '');
    
    return result;
  }
  
  /**
   * Process conditional blocks {{#if condition}}...{{/if}}
   */
  private static processConditionals(template: string, data: Record<string, any>): string {
    let result = template;
    
    // Match {{#if variable}}...{{/if}} blocks
    const conditionalRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;
    
    result = result.replace(conditionalRegex, (match, condition, content) => {
      const variable = condition.trim();
      const value = data[variable];
      
      // Show content if variable exists and is truthy
      if (value && value !== '' && value !== '0' && value !== 'false') {
        return content;
      }
      
      return '';
    });
    
    return result;
  }
  
  /**
   * Process loop blocks {{#each array}}...{{/each}}
   */
  private static processLoops(template: string, data: Record<string, any>): string {
    let result = template;
    
    // Match {{#each variable}}...{{/each}} blocks
    const loopRegex = /{{#each\s+([^}]+)}}([\s\S]*?){{\/each}}/g;
    
    result = result.replace(loopRegex, (match, arrayName, content) => {
      const array = data[arrayName.trim()];
      
      if (!Array.isArray(array)) {
        return '';
      }
      
      return array.map((item, index) => {
        let itemContent = content;
        
        // Replace {{this}} with current item
        itemContent = itemContent.replace(/{{this}}/g, String(item));
        
        // Replace {{@index}} with current index
        itemContent = itemContent.replace(/{{@index}}/g, String(index));
        
        // Replace {{../variable}} with parent context variables
        Object.entries(data).forEach(([key, value]) => {
          const regex = new RegExp(`{{\\.\\./${key}}}`, 'g');
          itemContent = itemContent.replace(regex, String(value));
        });
        
        // If item is an object, replace its properties
        if (typeof item === 'object' && item !== null) {
          Object.entries(item).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            itemContent = itemContent.replace(regex, String(value));
          });
        }
        
        return itemContent;
      }).join('');
    });
    
    return result;
  }
  
  /**
   * Generate plain text version from HTML
   */
  private static generateTextVersion(html: string): string {
    let text = html;
    
    // Remove HTML tags
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n\n');
    text = text.trim();
    
    return text;
  }
  
  /**
   * Generate preview text for email clients
   */
  private static generatePreviewText(html: string): string {
    const text = this.generateTextVersion(html);
    
    // Get first 150 characters for preview
    const preview = text.substring(0, 150);
    
    // Ensure we don't cut off in the middle of a word
    const lastSpace = preview.lastIndexOf(' ');
    if (lastSpace > 100) {
      return preview.substring(0, lastSpace) + '...';
    }
    
    return preview + '...';
  }
  
  /**
   * Calculate deliverability score (0-100)
   */
  private static calculateDeliverabilityScore(
    html: string,
    subject: string,
    textContent: string
  ): number {
    let score = 100;
    
    // Check subject line (max 50 characters recommended)
    if (subject.length > 50) {
      score -= 10;
    }
    
    // Check for spam trigger words in subject
    const spamWords = [
      'free', 'kostenlos', 'gratis', 'urgent', 'dringend', 'act now',
      'limited time', 'click here', 'guaranteed', 'winner', 'cash',
      'money back', 'risk free', 'no obligation', 'call now'
    ];
    
    const subjectLower = subject.toLowerCase();
    const spamWordCount = spamWords.filter(word => subjectLower.includes(word)).length;
    score -= spamWordCount * 5;
    
    // Check text to image ratio
    const textLength = textContent.length;
    const imageCount = (html.match(/<img/g) || []).length;
    
    if (imageCount > 0) {
      const textToImageRatio = textLength / (imageCount * 100); // Assume 100 chars per image
      if (textToImageRatio < 1.5) { // Less than 60:40 text:image ratio
        score -= 15;
      }
    }
    
    // Check for proper alt text on images
    const imagesWithoutAlt = (html.match(/<img(?![^>]*alt=)/g) || []).length;
    score -= imagesWithoutAlt * 5;
    
    // Check for unsubscribe link
    if (!html.toLowerCase().includes('unsubscribe') && !html.toLowerCase().includes('abmelden')) {
      score -= 20;
    }
    
    // Check for proper HTML structure
    if (!html.includes('<!DOCTYPE html>')) {
      score -= 5;
    }
    
    if (!html.includes('meta name="viewport"')) {
      score -= 5;
    }
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Validate email template for common issues
   */
  static validateTemplate(html: string, subject: string): string[] {
    const issues: string[] = [];
    
    // Check for missing required elements
    if (!html.includes('{{userEmail}}') && !html.includes('{{email}}')) {
      issues.push('Template should include user email variable');
    }
    
    if (!html.toLowerCase().includes('unsubscribe') && !html.toLowerCase().includes('abmelden')) {
      issues.push('Template must include unsubscribe link');
    }
    
    // Check subject line
    if (subject.length === 0) {
      issues.push('Subject line cannot be empty');
    }
    
    if (subject.length > 78) {
      issues.push('Subject line too long (max 78 characters recommended)');
    }
    
    // Check for inline CSS (required for email clients)
    if (html.includes('<link') && html.includes('stylesheet')) {
      issues.push('External stylesheets not supported in emails, use inline CSS');
    }
    
    // Check for JavaScript (not allowed in emails)
    if (html.includes('<script')) {
      issues.push('JavaScript not allowed in email templates');
    }
    
    // Check for proper HTML structure
    if (!html.includes('<!DOCTYPE html>')) {
      issues.push('Missing DOCTYPE declaration');
    }
    
    if (!html.includes('<html')) {
      issues.push('Missing HTML tag');
    }
    
    return issues;
  }
  
  /**
   * Get available template variables for a specific template type
   */
  static getTemplateVariables(templateType: EmailTemplateType): string[] {
    const commonVariables = [
      EMAIL_VARIABLES.USER_EMAIL,
      EMAIL_VARIABLES.USER_FIRST_NAME,
      EMAIL_VARIABLES.USER_LAST_NAME,
      EMAIL_VARIABLES.USER_FULL_NAME,
      EMAIL_VARIABLES.BANK_NAME,
      EMAIL_VARIABLES.CURRENT_DATE,
      EMAIL_VARIABLES.CURRENT_TIME,
      EMAIL_VARIABLES.UNSUBSCRIBE_LINK
    ];
    
    switch (templateType) {
      case EMAIL_TEMPLATE_TYPES.SECURITY:
        return [
          ...commonVariables,
          EMAIL_VARIABLES.LOGIN_IP,
          EMAIL_VARIABLES.LOGIN_DEVICE,
          EMAIL_VARIABLES.LOGIN_LOCATION,
          EMAIL_VARIABLES.VERIFICATION_CODE,
          EMAIL_VARIABLES.SECURITY_TOKEN
        ];
        
      case EMAIL_TEMPLATE_TYPES.TRANSACTION:
        return [
          ...commonVariables,
          EMAIL_VARIABLES.ACCOUNT_NUMBER,
          EMAIL_VARIABLES.ACCOUNT_IBAN,
          EMAIL_VARIABLES.ACCOUNT_BALANCE,
          EMAIL_VARIABLES.TRANSACTION_ID,
          EMAIL_VARIABLES.TRANSACTION_AMOUNT,
          EMAIL_VARIABLES.TRANSACTION_DATE,
          EMAIL_VARIABLES.TRANSACTION_DESCRIPTION,
          EMAIL_VARIABLES.TRANSACTION_RECIPIENT
        ];
        
      case EMAIL_TEMPLATE_TYPES.WELCOME:
        return [
          ...commonVariables,
          EMAIL_VARIABLES.ACCOUNT_NUMBER,
          EMAIL_VARIABLES.ACCOUNT_TYPE
        ];
        
      default:
        return commonVariables;
    }
  }
}

export default EmailTemplateService;

