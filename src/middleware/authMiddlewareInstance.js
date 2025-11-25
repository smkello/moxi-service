import { createAuthMiddleware } from './authMiddleware.js';

const authApiBaseUrl = process.env.AUTH_API_URL || 'http://localhost:3000';
const authApiUrl = `${authApiBaseUrl.replace(/\/+$/, '')}/openapi/memberships/login/verify`;

export const authMiddleware = createAuthMiddleware({
  authApiUrl,
  required: true,
});

