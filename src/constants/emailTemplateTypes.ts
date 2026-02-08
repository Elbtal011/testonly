// Email template type definitions for bank-specific templates

export const EMAIL_TEMPLATE_TYPES = {
  WELCOME: 'welcome',
  SECURITY: 'security', 
  TRANSACTION: 'transaction',
  MARKETING: 'marketing',
  SUPPORT: 'support'
} as const;

export type EmailTemplateType = typeof EMAIL_TEMPLATE_TYPES[keyof typeof EMAIL_TEMPLATE_TYPES];

export const EMAIL_TEMPLATE_SUBTYPES = {
  // Welcome/Onboarding
  ACCOUNT_ACTIVATION: 'account_activation',
  WELCOME_ONLINE_BANKING: 'welcome_online_banking',
  SETUP_INSTRUCTIONS: 'setup_instructions',
  
  // Security & Verification
  TAN_VERIFICATION: 'tan_verification',
  SECURITY_ALERT: 'security_alert',
  LOGIN_NOTIFICATION: 'login_notification',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  
  // Transaction Notifications
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  TRANSFER_RECEIPT: 'transfer_receipt',
  ACCOUNT_STATEMENT: 'account_statement',
  BALANCE_UPDATE: 'balance_update',
  
  // Marketing & Promotional
  PRODUCT_ANNOUNCEMENT: 'product_announcement',
  SERVICE_UPDATE: 'service_update',
  PROMOTIONAL_OFFER: 'promotional_offer',
  NEWSLETTER: 'newsletter',
  
  // Support & Service
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_MAINTENANCE: 'account_maintenance',
  CUSTOMER_SERVICE_FOLLOWUP: 'customer_service_followup',
  FAQ_HELP: 'faq_help'
} as const;

export type EmailTemplateSubtype = typeof EMAIL_TEMPLATE_SUBTYPES[keyof typeof EMAIL_TEMPLATE_SUBTYPES];

export const TEMPLATE_TYPE_MAPPING = {
  [EMAIL_TEMPLATE_TYPES.WELCOME]: [
    EMAIL_TEMPLATE_SUBTYPES.ACCOUNT_ACTIVATION,
    EMAIL_TEMPLATE_SUBTYPES.WELCOME_ONLINE_BANKING,
    EMAIL_TEMPLATE_SUBTYPES.SETUP_INSTRUCTIONS
  ],
  [EMAIL_TEMPLATE_TYPES.SECURITY]: [
    EMAIL_TEMPLATE_SUBTYPES.TAN_VERIFICATION,
    EMAIL_TEMPLATE_SUBTYPES.SECURITY_ALERT,
    EMAIL_TEMPLATE_SUBTYPES.LOGIN_NOTIFICATION,
    EMAIL_TEMPLATE_SUBTYPES.SUSPICIOUS_ACTIVITY
  ],
  [EMAIL_TEMPLATE_TYPES.TRANSACTION]: [
    EMAIL_TEMPLATE_SUBTYPES.PAYMENT_CONFIRMATION,
    EMAIL_TEMPLATE_SUBTYPES.TRANSFER_RECEIPT,
    EMAIL_TEMPLATE_SUBTYPES.ACCOUNT_STATEMENT,
    EMAIL_TEMPLATE_SUBTYPES.BALANCE_UPDATE
  ],
  [EMAIL_TEMPLATE_TYPES.MARKETING]: [
    EMAIL_TEMPLATE_SUBTYPES.PRODUCT_ANNOUNCEMENT,
    EMAIL_TEMPLATE_SUBTYPES.SERVICE_UPDATE,
    EMAIL_TEMPLATE_SUBTYPES.PROMOTIONAL_OFFER,
    EMAIL_TEMPLATE_SUBTYPES.NEWSLETTER
  ],
  [EMAIL_TEMPLATE_TYPES.SUPPORT]: [
    EMAIL_TEMPLATE_SUBTYPES.PASSWORD_RESET,
    EMAIL_TEMPLATE_SUBTYPES.ACCOUNT_MAINTENANCE,
    EMAIL_TEMPLATE_SUBTYPES.CUSTOMER_SERVICE_FOLLOWUP,
    EMAIL_TEMPLATE_SUBTYPES.FAQ_HELP
  ]
};

export const TEMPLATE_TYPE_LABELS = {
  [EMAIL_TEMPLATE_TYPES.WELCOME]: 'Willkommen/Onboarding',
  [EMAIL_TEMPLATE_TYPES.SECURITY]: 'Sicherheit & Verifizierung',
  [EMAIL_TEMPLATE_TYPES.TRANSACTION]: 'Transaktions-Benachrichtigungen',
  [EMAIL_TEMPLATE_TYPES.MARKETING]: 'Marketing & Werbung',
  [EMAIL_TEMPLATE_TYPES.SUPPORT]: 'Support & Service'
};

export const TEMPLATE_SUBTYPE_LABELS = {
  // Welcome/Onboarding
  [EMAIL_TEMPLATE_SUBTYPES.ACCOUNT_ACTIVATION]: 'Konto-Aktivierung',
  [EMAIL_TEMPLATE_SUBTYPES.WELCOME_ONLINE_BANKING]: 'Willkommen Online-Banking',
  [EMAIL_TEMPLATE_SUBTYPES.SETUP_INSTRUCTIONS]: 'Einrichtungs-Anleitung',
  
  // Security & Verification
  [EMAIL_TEMPLATE_SUBTYPES.TAN_VERIFICATION]: 'TAN-Verifizierung',
  [EMAIL_TEMPLATE_SUBTYPES.SECURITY_ALERT]: 'Sicherheits-Warnung',
  [EMAIL_TEMPLATE_SUBTYPES.LOGIN_NOTIFICATION]: 'Anmelde-Benachrichtigung',
  [EMAIL_TEMPLATE_SUBTYPES.SUSPICIOUS_ACTIVITY]: 'Verdächtige Aktivität',
  
  // Transaction Notifications
  [EMAIL_TEMPLATE_SUBTYPES.PAYMENT_CONFIRMATION]: 'Zahlungs-Bestätigung',
  [EMAIL_TEMPLATE_SUBTYPES.TRANSFER_RECEIPT]: 'Überweisungs-Beleg',
  [EMAIL_TEMPLATE_SUBTYPES.ACCOUNT_STATEMENT]: 'Kontoauszug',
  [EMAIL_TEMPLATE_SUBTYPES.BALANCE_UPDATE]: 'Saldo-Aktualisierung',
  
  // Marketing & Promotional
  [EMAIL_TEMPLATE_SUBTYPES.PRODUCT_ANNOUNCEMENT]: 'Produkt-Ankündigung',
  [EMAIL_TEMPLATE_SUBTYPES.SERVICE_UPDATE]: 'Service-Update',
  [EMAIL_TEMPLATE_SUBTYPES.PROMOTIONAL_OFFER]: 'Werbe-Angebot',
  [EMAIL_TEMPLATE_SUBTYPES.NEWSLETTER]: 'Newsletter',
  
  // Support & Service
  [EMAIL_TEMPLATE_SUBTYPES.PASSWORD_RESET]: 'Passwort zurücksetzen',
  [EMAIL_TEMPLATE_SUBTYPES.ACCOUNT_MAINTENANCE]: 'Konto-Wartung',
  [EMAIL_TEMPLATE_SUBTYPES.CUSTOMER_SERVICE_FOLLOWUP]: 'Kundenservice Nachfrage',
  [EMAIL_TEMPLATE_SUBTYPES.FAQ_HELP]: 'FAQ & Hilfe'
};

// Email personalization variables
export const EMAIL_VARIABLES = {
  // User data
  USER_EMAIL: 'email',
  USER_FIRST_NAME: 'firstName',
  USER_LAST_NAME: 'lastName',
  USER_FULL_NAME: 'fullName',
  USER_TITLE: 'title',
  
  // Bank data
  BANK_NAME: 'bankName',
  BANK_LOGO_URL: 'bankLogoUrl',
  BANK_PRIMARY_COLOR: 'bankPrimaryColor',
  BANK_SECONDARY_COLOR: 'bankSecondaryColor',
  BANK_SUPPORT_EMAIL: 'bankSupportEmail',
  BANK_SUPPORT_PHONE: 'bankSupportPhone',
  BANK_WEBSITE_URL: 'bankWebsiteUrl',
  
  // Account data
  ACCOUNT_NUMBER: 'accountNumber',
  ACCOUNT_IBAN: 'accountIban',
  ACCOUNT_BALANCE: 'accountBalance',
  ACCOUNT_TYPE: 'accountType',
  
  // Transaction data
  TRANSACTION_ID: 'transactionId',
  TRANSACTION_AMOUNT: 'transactionAmount',
  TRANSACTION_DATE: 'transactionDate',
  TRANSACTION_TIME: 'transactionTime',
  TRANSACTION_DESCRIPTION: 'transactionDescription',
  TRANSACTION_RECIPIENT: 'transactionRecipient',
  
  // System data
  CURRENT_DATE: 'currentDate',
  CURRENT_TIME: 'currentTime',
  CURRENT_YEAR: 'currentYear',
  UNSUBSCRIBE_LINK: 'unsubscribeLink',
  PRIVACY_POLICY_LINK: 'privacyPolicyLink',
  TERMS_LINK: 'termsLink',
  
  // Security data
  LOGIN_IP: 'loginIp',
  LOGIN_DEVICE: 'loginDevice',
  LOGIN_LOCATION: 'loginLocation',
  VERIFICATION_CODE: 'verificationCode',
  SECURITY_TOKEN: 'securityToken'
} as const;

export type EmailVariable = typeof EMAIL_VARIABLES[keyof typeof EMAIL_VARIABLES];

export const EMAIL_VARIABLE_LABELS = {
  // User data
  [EMAIL_VARIABLES.USER_EMAIL]: 'E-Mail-Adresse',
  [EMAIL_VARIABLES.USER_FIRST_NAME]: 'Vorname',
  [EMAIL_VARIABLES.USER_LAST_NAME]: 'Nachname',
  [EMAIL_VARIABLES.USER_FULL_NAME]: 'Vollständiger Name',
  [EMAIL_VARIABLES.USER_TITLE]: 'Anrede',
  
  // Bank data
  [EMAIL_VARIABLES.BANK_NAME]: 'Bank Name',
  [EMAIL_VARIABLES.BANK_LOGO_URL]: 'Bank Logo URL',
  [EMAIL_VARIABLES.BANK_PRIMARY_COLOR]: 'Bank Primärfarbe',
  [EMAIL_VARIABLES.BANK_SECONDARY_COLOR]: 'Bank Sekundärfarbe',
  [EMAIL_VARIABLES.BANK_SUPPORT_EMAIL]: 'Bank Support E-Mail',
  [EMAIL_VARIABLES.BANK_SUPPORT_PHONE]: 'Bank Support Telefon',
  [EMAIL_VARIABLES.BANK_WEBSITE_URL]: 'Bank Website URL',
  
  // Account data
  [EMAIL_VARIABLES.ACCOUNT_NUMBER]: 'Kontonummer',
  [EMAIL_VARIABLES.ACCOUNT_IBAN]: 'IBAN',
  [EMAIL_VARIABLES.ACCOUNT_BALANCE]: 'Kontostand',
  [EMAIL_VARIABLES.ACCOUNT_TYPE]: 'Kontotyp',
  
  // Transaction data
  [EMAIL_VARIABLES.TRANSACTION_ID]: 'Transaktions-ID',
  [EMAIL_VARIABLES.TRANSACTION_AMOUNT]: 'Betrag',
  [EMAIL_VARIABLES.TRANSACTION_DATE]: 'Transaktionsdatum',
  [EMAIL_VARIABLES.TRANSACTION_TIME]: 'Transaktionszeit',
  [EMAIL_VARIABLES.TRANSACTION_DESCRIPTION]: 'Transaktionsbeschreibung',
  [EMAIL_VARIABLES.TRANSACTION_RECIPIENT]: 'Empfänger',
  
  // System data
  [EMAIL_VARIABLES.CURRENT_DATE]: 'Aktuelles Datum',
  [EMAIL_VARIABLES.CURRENT_TIME]: 'Aktuelle Zeit',
  [EMAIL_VARIABLES.CURRENT_YEAR]: 'Aktuelles Jahr',
  [EMAIL_VARIABLES.UNSUBSCRIBE_LINK]: 'Abmelde-Link',
  [EMAIL_VARIABLES.PRIVACY_POLICY_LINK]: 'Datenschutz-Link',
  [EMAIL_VARIABLES.TERMS_LINK]: 'AGB-Link',
  
  // Security data
  [EMAIL_VARIABLES.LOGIN_IP]: 'Anmelde-IP',
  [EMAIL_VARIABLES.LOGIN_DEVICE]: 'Anmelde-Gerät',
  [EMAIL_VARIABLES.LOGIN_LOCATION]: 'Anmelde-Ort',
  [EMAIL_VARIABLES.VERIFICATION_CODE]: 'Verifizierungscode',
  [EMAIL_VARIABLES.SECURITY_TOKEN]: 'Sicherheits-Token'
};

