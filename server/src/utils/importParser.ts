/**
 * Import Parser Utility
 * Flexible parser for TXT/CSV files with German name and address parsing
 */

export interface ParsedLeadData {
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  street?: string;
  street_number?: string;
  plz?: string;
  city?: string;
  email?: string;
  raw_line?: string;
  parse_errors?: string[];
}

export interface ParseResult {
  success: boolean;
  leads: ParsedLeadData[];
  errors: Array<{ line: number; error: string; raw: string }>;
  stats: {
    total_lines: number;
    parsed_successfully: number;
    parse_errors: number;
    detected_format: string;
    detected_delimiter: string;
  };
}

type DelimiterType = '|' | ',' | '\t' | ';';

/**
 * Detect the delimiter used in the file
 */
function detectDelimiter(lines: string[]): DelimiterType {
  const delimiters: DelimiterType[] = ['|', ',', '\t', ';'];
  const counts: Record<DelimiterType, number> = { '|': 0, ',': 0, '\t': 0, ';': 0 };
  
  // Sample first 10 non-empty lines
  const sampleLines = lines.filter(line => line.trim()).slice(0, 10);
  
  for (const line of sampleLines) {
    for (const delim of delimiters) {
      counts[delim] += (line.split(delim).length - 1);
    }
  }
  
  // Find the delimiter with the most consistent count
  let bestDelimiter: DelimiterType = '|';
  let maxCount = 0;
  
  for (const delim of delimiters) {
    if (counts[delim] > maxCount) {
      maxCount = counts[delim];
      bestDelimiter = delim;
    }
  }
  
  return bestDelimiter;
}

/**
 * Normalize German phone number to international format
 */
function normalizeGermanPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all whitespace and special characters except +
  let normalized = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Handle various German phone formats
  if (normalized.startsWith('0049')) {
    normalized = '+49' + normalized.substring(4);
  } else if (normalized.startsWith('49') && !normalized.startsWith('+')) {
    normalized = '+49' + normalized.substring(2);
  } else if (normalized.startsWith('0') && !normalized.startsWith('00')) {
    // German local format (0xxx) -> +49xxx
    normalized = '+49' + normalized.substring(1);
  }
  
  return normalized;
}

/**
 * Parse German date format (DD.MM.YYYY) to ISO format
 */
function parseGermanDate(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  
  // Try DD.MM.YYYY format
  const germanMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (germanMatch) {
    const [, day, month, year] = germanMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try YYYY-MM-DD format (already ISO)
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return dateStr;
  }
  
  // Try DD/MM/YYYY format
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return dateStr; // Return as-is if no format matches
}

/**
 * Parse a German full name into first name and last name
 * Handles multiple first names (e.g., "Josefine Katharina Braun" -> first: "Josefine Katharina", last: "Braun")
 */
function parseGermanName(fullName: string): { first_name: string; last_name: string } {
  if (!fullName) return { first_name: '', last_name: '' };
  
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  
  if (parts.length === 0) {
    return { first_name: '', last_name: '' };
  }
  
  if (parts.length === 1) {
    // Single name - could be first or last, assume first
    return { first_name: parts[0], last_name: '' };
  }
  
  if (parts.length === 2) {
    // Standard "First Last" format
    return { first_name: parts[0], last_name: parts[1] };
  }
  
  // Multiple parts - last word is last name, rest is first name(s)
  // This handles cases like "Anna-Julia Meyer" or "Josefine Katharina Braun"
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  
  return { first_name: firstName, last_name: lastName };
}

/**
 * Parse a German address string into components
 * Handles formats like:
 * - "Lindenstr. 13, 34212 Melsungen"
 * - "Lindenstr. 13, 34212 Melsungen, Röhrenfurth"
 * - "Bahnhofstr. 7, 01945 Ruhland"
 * - "57629 Stein-Wingert" (PLZ + City only)
 */
function parseGermanAddress(address: string): { 
  street?: string; 
  street_number?: string; 
  plz?: string; 
  city?: string;
  full_address: string;
} {
  if (!address) return { full_address: '' };
  
  const trimmed = address.trim();
  const result: { 
    street?: string; 
    street_number?: string; 
    plz?: string; 
    city?: string;
    full_address: string;
  } = { full_address: trimmed };
  
  // Try to extract PLZ (German postal code - 5 digits)
  const plzMatch = trimmed.match(/\b(\d{5})\b/);
  if (plzMatch) {
    result.plz = plzMatch[1];
  }
  
  // Split by comma to separate street from city
  const parts = trimmed.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    // First part is street with number
    const streetPart = parts[0];
    
    // Extract street number (can be at end like "Lindenstr. 13" or "Str. 7" or "2D")
    const streetMatch = streetPart.match(/^(.+?)\s+(\d+[A-Za-z]?)$/);
    if (streetMatch) {
      result.street = streetMatch[1].trim();
      result.street_number = streetMatch[2];
    } else {
      result.street = streetPart;
    }
    
    // Second part is PLZ + City (and possibly district)
    const cityPart = parts[1];
    const cityMatch = cityPart.match(/^(\d{5})\s+(.+)$/);
    if (cityMatch) {
      result.plz = cityMatch[1];
      result.city = cityMatch[2].trim();
    } else if (!result.plz) {
      // No PLZ found, entire second part is city
      result.city = cityPart;
    } else {
      // PLZ was found elsewhere, extract city from remaining text
      result.city = cityPart.replace(/^\d{5}\s*/, '').trim();
    }
    
    // If there's a third part, it might be a district - append to city
    if (parts.length >= 3 && parts[2]) {
      // Don't append if it's just the PLZ repeated
      if (!parts[2].match(/^\d{5}$/)) {
        // Keep district info in city for now
      }
    }
  } else {
    // Single part - might be just "PLZ City" format
    const simpleCityMatch = trimmed.match(/^(\d{5})\s+(.+)$/);
    if (simpleCityMatch) {
      result.plz = simpleCityMatch[1];
      result.city = simpleCityMatch[2].trim();
    }
  }
  
  return result;
}

/**
 * Parse a single line of data
 */
function parseLine(
  line: string, 
  delimiter: DelimiterType,
  fieldOrder: string[]
): ParsedLeadData {
  const fields = line.split(delimiter).map(f => f.trim());
  const result: ParsedLeadData = {
    first_name: '',
    last_name: '',
    raw_line: line,
    parse_errors: []
  };
  
  for (let i = 0; i < fields.length && i < fieldOrder.length; i++) {
    const fieldType = fieldOrder[i];
    const value = fields[i];
    
    if (!value) continue;
    
    switch (fieldType) {
      case 'name':
      case 'full_name':
        const { first_name, last_name } = parseGermanName(value);
        result.first_name = first_name;
        result.last_name = last_name;
        break;
        
      case 'first_name':
        result.first_name = value;
        break;
        
      case 'last_name':
        result.last_name = value;
        break;
        
      case 'phone':
      case 'telefon':
      case 'mobile':
      case 'handy':
        result.phone = normalizeGermanPhone(value);
        break;
        
      case 'dob':
      case 'date_of_birth':
      case 'geburtsdatum':
      case 'birthday':
        result.date_of_birth = parseGermanDate(value);
        break;
        
      case 'address':
      case 'adresse':
        const addressParts = parseGermanAddress(value);
        result.street = addressParts.street;
        result.street_number = addressParts.street_number;
        result.plz = addressParts.plz;
        result.city = addressParts.city;
        break;
        
      case 'street':
      case 'strasse':
        result.street = value;
        break;
        
      case 'street_number':
      case 'hausnummer':
        result.street_number = value;
        break;
        
      case 'plz':
      case 'zip':
      case 'postal_code':
        result.plz = value;
        break;
        
      case 'city':
      case 'stadt':
      case 'ort':
        result.city = value;
        break;
        
      case 'email':
      case 'e-mail':
        result.email = value.toLowerCase();
        break;
        
      default:
        // Unknown field type, skip
        break;
    }
  }
  
  // Validation
  if (!result.first_name && !result.last_name) {
    result.parse_errors?.push('No name found');
  }
  
  return result;
}

/**
 * Detect field order from header line or first data line
 */
function detectFieldOrder(line: string, delimiter: DelimiterType): string[] {
  const fields = line.split(delimiter).map(f => f.trim().toLowerCase());
  const fieldMapping: Record<string, string> = {
    'name': 'name',
    'full name': 'name',
    'full_name': 'name',
    'vollständiger name': 'name',
    'vor- und nachname': 'name',
    'first name': 'first_name',
    'first_name': 'first_name',
    'vorname': 'first_name',
    'last name': 'last_name',
    'last_name': 'last_name',
    'nachname': 'last_name',
    'familienname': 'last_name',
    'phone': 'phone',
    'telefon': 'phone',
    'tel': 'phone',
    'mobile': 'phone',
    'handy': 'phone',
    'telefonnummer': 'phone',
    'dob': 'dob',
    'date of birth': 'dob',
    'date_of_birth': 'dob',
    'geburtsdatum': 'dob',
    'birthday': 'dob',
    'geburtstag': 'dob',
    'address': 'address',
    'adresse': 'address',
    'anschrift': 'address',
    'street': 'street',
    'strasse': 'street',
    'straße': 'street',
    'str': 'street',
    'street_number': 'street_number',
    'hausnummer': 'street_number',
    'hnr': 'street_number',
    'nr': 'street_number',
    'plz': 'plz',
    'zip': 'plz',
    'postal code': 'plz',
    'postal_code': 'plz',
    'postleitzahl': 'plz',
    'city': 'city',
    'stadt': 'city',
    'ort': 'city',
    'wohnort': 'city',
    'email': 'email',
    'e-mail': 'email',
    'mail': 'email'
  };
  
  // Check if this looks like a header row
  const isHeader = fields.some(f => 
    Object.keys(fieldMapping).includes(f) || 
    /^(name|phone|email|address|dob)/i.test(f)
  );
  
  if (isHeader) {
    return fields.map(f => fieldMapping[f] || 'unknown');
  }
  
  // Not a header - try to detect from data patterns
  // Default order based on sample file: name | phone | dob | address
  // But also handle: name | phone | address (no DOB)
  
  const detectedOrder: string[] = [];
  
  for (const field of fields) {
    // Check if it looks like a phone number
    if (/^\+?\d[\d\s\-\(\)]{8,}$/.test(field)) {
      detectedOrder.push('phone');
    }
    // Check if it looks like a German date
    else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(field)) {
      detectedOrder.push('dob');
    }
    // Check if it looks like an email
    else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field)) {
      detectedOrder.push('email');
    }
    // Check if it contains a German PLZ (5 digits)
    else if (/\d{5}/.test(field) && (field.includes(',') || field.includes(' '))) {
      detectedOrder.push('address');
    }
    // Check if it looks like just a PLZ + city
    else if (/^\d{5}\s+\S/.test(field)) {
      detectedOrder.push('address');
    }
    // First unidentified field is probably name
    else if (detectedOrder.length === 0 || !detectedOrder.includes('name')) {
      detectedOrder.push('name');
    }
    // Otherwise unknown
    else {
      detectedOrder.push('unknown');
    }
  }
  
  return detectedOrder;
}

/**
 * Main parser function - parses file content into lead data
 */
export function parseImportFile(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length === 0) {
    return {
      success: false,
      leads: [],
      errors: [{ line: 0, error: 'File is empty', raw: '' }],
      stats: {
        total_lines: 0,
        parsed_successfully: 0,
        parse_errors: 1,
        detected_format: 'unknown',
        detected_delimiter: ''
      }
    };
  }
  
  // Detect delimiter
  const delimiter = detectDelimiter(lines);
  
  // Detect field order from first line
  const fieldOrder = detectFieldOrder(lines[0], delimiter);
  
  // Check if first line is a header
  const firstLineFields = lines[0].split(delimiter).map(f => f.trim().toLowerCase());
  const isHeader = firstLineFields.some(f => 
    ['name', 'phone', 'telefon', 'email', 'address', 'adresse', 'vorname', 'nachname'].includes(f)
  );
  
  const startLine = isHeader ? 1 : 0;
  
  const leads: ParsedLeadData[] = [];
  const errors: Array<{ line: number; error: string; raw: string }> = [];
  
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    try {
      const parsed = parseLine(line, delimiter, fieldOrder);
      
      if (parsed.parse_errors && parsed.parse_errors.length > 0) {
        errors.push({
          line: i + 1,
          error: parsed.parse_errors.join('; '),
          raw: line
        });
      }
      
      // Only add if we have at least a name
      if (parsed.first_name || parsed.last_name) {
        leads.push(parsed);
      } else {
        errors.push({
          line: i + 1,
          error: 'Could not extract name from line',
          raw: line
        });
      }
    } catch (error) {
      errors.push({
        line: i + 1,
        error: error instanceof Error ? error.message : 'Unknown parse error',
        raw: line
      });
    }
  }
  
  const delimiterNames: Record<DelimiterType, string> = {
    '|': 'pipe',
    ',': 'comma',
    '\t': 'tab',
    ';': 'semicolon'
  };
  
  return {
    success: leads.length > 0,
    leads,
    errors,
    stats: {
      total_lines: lines.length - (isHeader ? 1 : 0),
      parsed_successfully: leads.length,
      parse_errors: errors.length,
      detected_format: isHeader ? 'csv_with_header' : 'delimited_data',
      detected_delimiter: delimiterNames[delimiter]
    }
  };
}

/**
 * Preview parser - returns first N rows for validation
 */
export function previewImportFile(content: string, maxRows: number = 5): ParseResult {
  const fullResult = parseImportFile(content);
  
  return {
    ...fullResult,
    leads: fullResult.leads.slice(0, maxRows),
    errors: fullResult.errors.slice(0, maxRows)
  };
}

export default {
  parseImportFile,
  previewImportFile,
  parseGermanName,
  parseGermanAddress,
  normalizeGermanPhone,
  parseGermanDate
};

