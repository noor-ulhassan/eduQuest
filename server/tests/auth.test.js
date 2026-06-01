import { createToken } from '../utils/createTokens.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

describe('Authentication Utilities', () => {
  const mockUser = { _id: '12345mockid' };
  
  beforeAll(() => {
    // Set a mock environment variable for testing
    process.env.JWT_SECRET = 'super-secret-test-key';
  });

  describe('createToken (JWT Generation)', () => {
    it('should generate a valid JWT token containing the user ID', () => {
      const token = createToken(mockUser);
      
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
      
      // Verify the payload contents
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.exp).toBeDefined(); // Should have an expiration date
    });
  });

  describe('Bcrypt Password Hashing', () => {
    it('should hash a password successfully', async () => {
      const plainPassword = 'mySecurePassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should correctly verify a matching password', async () => {
      const plainPassword = 'mySecurePassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const plainPassword = 'mySecurePassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const isMatch = await bcrypt.compare('wrongPassword', hashedPassword);
      expect(isMatch).toBe(false);
    });
  });
});
