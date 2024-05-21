import jwt, { Secret, JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const [ACCESS_SECRET_KEY, ACCESS_SECRET_TIME] = [
    process.env.ACCESS_SECRET_KEY,
    process.env.ACCESS_SECRET_TIME
];

export type UserType = {
    userId: string;
    _id: string;
    isAdmin: Boolean;
};

// Function to get the JWT secret key
export function getJwtSecret(): string {
    return ACCESS_SECRET_KEY!;
}

export const getAccessToken = (user: UserType): string => {
    const accessToken = jwt.sign(
        {
            _id: user._id,
            userId: user.userId,
            isAdmin: user.isAdmin
        },
        getJwtSecret(),
        {
            expiresIn: ACCESS_SECRET_TIME
        }
    );
    return accessToken;
};

export const verifyToken = (token: string, key: Secret): UserType => {
    try {
        const payload = jwt.verify(token, key) as UserType;
        return payload;
    } catch (error: unknown) {
        if (error instanceof JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw new Error(String(error));
    }
};

export const getCookieOptions = (TTL: any) => ({
    maxAge: TTL,
    httpOnly: true,
    secure: false,
    sameSite: 'None'
});
