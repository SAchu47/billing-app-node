import { RESPONSE } from '../config/constantResponse';
import dotenv from 'dotenv';
import Logging from '../config/consoleLogging';
import responseBuilder from '../config/responseBuilder';
dotenv.config();
import { getAccessToken, verifyToken, getJwtSecret, UserType } from '../config/auth';
import { Request, Response, NextFunction } from 'express';

// Define an interface for the custom properties added to the Request object
export interface CustomRequest extends Request {
    accessToken: string;
    user: UserType;
}

// check if the user has logged in before using the services
export const checkAuthorization = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customReq = req as CustomRequest;
        // Safely access the authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            Logging.error('Authorization header is missing');
            return res.status(401).json(responseBuilder(false, RESPONSE.AUTHERROR));
        }

        // Extract the token
        const token = authHeader.split(' ')[1];

        if (!token) {
            Logging.error('Bearer token is missing');
            return res.status(401).json(responseBuilder(false, RESPONSE.AUTHERROR));
        }

        let payload: UserType;

        // Verify the access token with the server
        try {
            payload = verifyToken(token, getJwtSecret());
        } catch (err) {
            Logging.error(`Token verification failed: ${err}`);
            return res.status(401).json(responseBuilder(false, RESPONSE.AUTHERROR));
        }

        // If accessToken is verified, generate a new token and attach it to the request
        if (payload) {
            customReq.accessToken = getAccessToken(payload);
            customReq.user = payload;
        }
        // continue the control-flow of the code or call the next middleware
        next();
    } catch (error) {
        // token was expired or user had made changes in the token
        Logging.error(error);
        return res.status(401).json(responseBuilder(false, RESPONSE.AUTHERROR));
    }
};
