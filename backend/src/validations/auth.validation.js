const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
});

const validateRegister = (data) => {
  return registerSchema.parse(data);
};

const validateLogin = (data) => {
  return loginSchema.parse(data);
};

module.exports = {
  validateRegister,
  validateLogin
}; 