import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is required in environment variables');
  }

  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};
