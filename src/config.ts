// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// Form Validation Constraints
export const VALIDATION = {
  NAME: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 60,
  },
  ADDRESS: {
    MAX_LENGTH: 400,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 16,
    PATTERN: /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
  },
};

// Rating Configuration
export const RATING = {
  MIN: 1,
  MAX: 5,
};