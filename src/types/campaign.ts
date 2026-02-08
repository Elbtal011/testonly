/**
 * Campaign status enum
 */
export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  SENDING = 'sending',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

/**
 * Campaign interface
 */
export interface Campaign {
  id: number;
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  domainId: string;
  templateId?: number;
  content?: string; // Optional HTML content if not using a template
  status: CampaignStatus;
  scheduledFor?: string; // ISO date string
  recipientListId?: number;
  recipientCount?: number;
  trackOpens: boolean;
  trackClicks: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

/**
 * Campaign statistics interface
 */
export interface CampaignStats {
  campaignId: number;
  sent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  complained: number;
  unsubscribed: number;
  lastUpdated: string;
}

/**
 * Campaign recipient interface
 */
export interface CampaignRecipient {
  id?: number;
  campaignId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  status: RecipientStatus;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  metadata?: Record<string, any>;
}

/**
 * Recipient status enum
 */
export enum RecipientStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  COMPLAINED = 'complained',
  UNSUBSCRIBED = 'unsubscribed'
}

/**
 * Email domain interface
 */
export interface Domain {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'failed' | 'temporary_failure' | 'unverified';
  created_at: string;
  region: string;
}

/**
 * Campaign create/update DTO
 */
export interface CampaignDTO {
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  domainId: string;
  templateId?: number;
  content?: string;
  scheduledFor?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
  metadata?: Record<string, any>;
}
