
import validator from 'validator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validatePhone = (phone: string): boolean => {
  // RFC 5322 / General phone validation: min 7 digits, num + +()-
  const cleaned = phone.replace(/[+()-\s]/g, '');
  return cleaned.length >= 7 && validator.isNumeric(cleaned);
};

export const validateDate = (dateStr: string, allowFuture: boolean = true): boolean => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  if (!allowFuture && date > new Date()) return false;
  return true;
};

export interface DataRow {
  [key: string]: any;
}

export interface ValidationConfig {
  requiredFields: string[];
  charLimits?: Record<string, number>;
  noFutureDateFields?: string[];
}

export const validateRow = (
  row: DataRow,
  config: ValidationConfig
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  config.requiredFields.forEach((field) => {
    if (!row[field] || validator.isEmpty(String(row[field]).trim())) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check character limits
  if (config.charLimits) {
    Object.entries(config.charLimits).forEach(([field, limit]) => {
      const val = row[field];
      if (val && String(val).length > limit) {
        errors.push(`Field ${field} exceeds limit of ${limit} characters`);
      }
    });
  }

  // Validate Emails
  Object.entries(row).forEach(([field, val]) => {
    if (field.toLowerCase().includes('email') && val) {
      if (!validateEmail(String(val))) {
        errors.push(`Invalid email format in field ${field}: ${val}`);
      }
    }
  });

  // Validate Phones
  Object.entries(row).forEach(([field, val]) => {
    if (field.toLowerCase().includes('phone') && val) {
      if (!validatePhone(String(val))) {
        warnings.push(`Suspicious phone format in field ${field}: ${val}`);
      }
    }
  });

  // Validate Dates
  if (config.noFutureDateFields) {
    config.noFutureDateFields.forEach((field) => {
      const val = row[field];
      if (val && !validateDate(String(val), false)) {
        errors.push(`Invalid or future date in field ${field}: ${val}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const detectDuplicates = (
  rows: DataRow[],
  uniqueKey: string = 'email'
): { duplicates: string[]; uniqueRows: DataRow[] } => {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  const uniqueRows: DataRow[] = [];

  rows.forEach((row) => {
    const key = String(row[uniqueKey] || '').toLowerCase().trim();
    if (key && seen.has(key)) {
      duplicates.push(key);
    } else {
      if (key) seen.add(key);
      uniqueRows.push(row);
    }
  });

  return { duplicates, uniqueRows };
};
