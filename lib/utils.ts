import jwt from 'jsonwebtoken';

const JWT_ACCESS_EXPIRES_IN = "15m";
const JWT_REFRESH_EXPIRES_IN = "7d";
const JWT_SECRET_ACCESS_TOKEN = process.env.NEXT_JWT_SECRET_ACCESS_TOKEN as string;
const JWT_SECRET_REFRESH_TOKEN = process.env.NEXT_JWT_SECRET_REFRESH_TOKEN as string;

export const generateToken = (userId: string) => ({
    access_token: jwt.sign({ id: userId }, JWT_SECRET_ACCESS_TOKEN, { expiresIn: JWT_ACCESS_EXPIRES_IN }),
    refresh_token: jwt.sign({ id: userId }, JWT_SECRET_REFRESH_TOKEN, { expiresIn: JWT_REFRESH_EXPIRES_IN }),
});