import { NextFunction, Request, Response } from 'express';
import Admin from '../models/Admin';
import responseBuilder from '../config/responseBuilder';
import { RESPONSE } from '../config/constantResponse';
import Logging from '../config/consoleLogging';
import { getAccessToken } from '../config/auth';
import { CustomRequest } from '../middleware/checkAuthorization';

//@description     create admin
//@route           POST /v1/admin/register
//@access          Admin
export const createAdmin = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    }

    const { userId, password, isAdmin } = req.body;

    await Admin.findOne({ userId }).then(async (userExists) => {
        if (userExists) {
            Logging.error('User already exists');
            return res.status(400).json(responseBuilder(false, RESPONSE.CONFLICT));
        } else {
            // Create a new admin
            await Admin.create({
                userId,
                password,
                isAdmin
            })
                .then((admin) => {
                    if (admin) {
                        const data = {
                            _id: admin._id,
                            userId: admin.userId,
                            isAdmin: admin.isAdmin
                        };
                        return res
                            .status(201)
                            .json(
                                responseBuilder(true, RESPONSE.CREATED, data, getAccessToken(data))
                            );
                    } else {
                        Logging.error('User not found');
                        return res.status(400).json(responseBuilder(false, RESPONSE.NODATA));
                    }
                })
                .catch((error: any) => {
                    Logging.error(`Error while creating the admin: ${error}`);
                    return res.status(400).json(responseBuilder(false, RESPONSE.FAILED));
                });
        }
    });
};

//@description     Delete admin
//@route           POST /v1/admin/delete/:id
//@access          Admin
export const deleteAdmin = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    }
    const _id = req.params.id;

    await Admin.findByIdAndDelete({ _id })
        .then((admin) => {
            if (admin) {
                return res
                    .status(200)
                    .json(responseBuilder(true, RESPONSE.DELETED, {}, getAccessToken(user)));
            } else {
                return res.status(200).json(responseBuilder(true, RESPONSE.NODATA));
            }
        })
        .catch((error: any) => {
            Logging.error(`Error while deleting the admin: ${error}`);
            return res.status(400).json(responseBuilder(false, RESPONSE.FAILED));
        });
};

//@description     Login admin
//@route           POST /v1/admin/login
//@access          Admin
export const LoginAdmin = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, password } = req.body;
    await Admin.findOne({ userId }).then(async (admin) => {
        if (admin && (await admin.matchPassword(password))) {
            const data = {
                _id: admin._id,
                userId: admin.userId,
                isAdmin: admin.isAdmin
            };
            return res
                .status(200)
                .json(responseBuilder(true, RESPONSE.SUCCESS, data, getAccessToken(data)));
        } else {
            Logging.error('Auth Error');
            return res.status(400).json(responseBuilder(false, RESPONSE.AUTHERROR));
        }
    });
};
