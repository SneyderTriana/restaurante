const authService = require('../../src/services/authService');
const { User } = require('../../src/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../../src/models');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockUser = {
        id: '123',
        ...userData,
        toJSON: () => ({ ...userData, id: '123' })
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-token');

      const result = await authService.register(userData);

      expect(result).toHaveProperty('token', 'mock-token');
      expect(result.user).toHaveProperty('email', userData.email);
      expect(User.create).toHaveBeenCalledWith(userData);
    });

    it('should throw error if email already exists', async () => {
      const userData = { email: 'existing@example.com' };
      User.findOne.mockResolvedValue({ id: '456' });

      await expect(authService.register(userData)).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        id: '123',
        email,
        password: 'hashed',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ id: '123', email })
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-token');

      const result = await authService.login(email, password);

      expect(result).toHaveProperty('token', 'mock-token');
      expect(result.user).toHaveProperty('email', email);
    });

    it('should throw error for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(authService.login('wrong@example.com', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });
  });
});