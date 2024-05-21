import { NextFunction, Request, Response } from 'express';
import Customer from '../models/Customer';
import responseBuilder from '../config/responseBuilder';
import { RESPONSE } from '../config/constantResponse';
import Logging from '../config/consoleLogging';
import { getAccessToken } from '../config/auth';
import { CustomRequest } from '../middleware/checkAuthorization';
import asyncHandler from 'express-async-handler';

//@description     create customer
//@route           POST /v1/customer/register
//@access          Admin
export const createCustomer = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    }

    const { customerName, customerPhoneNumber, paymentDueDate } = req.body;

    await Customer.findOne({ customerPhoneNumber }).then(async (userExists) => {
        if (userExists) {
            Logging.error('User already exists');
            return res.status(400).json(responseBuilder(false, RESPONSE.CONFLICT));
        } else {
            // Create a new admin
            await Customer.create({
                customerName,
                customerPhoneNumber,
                paymentDueDate
            })
                .then((customer) => {
                    if (customer) {
                        const data = {
                            customerPhoneNumber: customer.customerPhoneNumber,
                            customerName: customer.customerName,
                            paymentDueDate: customer.paymentDueDate,
                            _id: customer._id
                        };
                        return res
                            .status(201)
                            .json(
                                responseBuilder(true, RESPONSE.CREATED, data, getAccessToken(user))
                            );
                    } else {
                        Logging.error('User not found');
                        return res.status(400).json(responseBuilder(false, RESPONSE.NODATA));
                    }
                })
                .catch((error: any) => {
                    Logging.error(`Error while creating the customer: ${error}`);
                    return res.status(400).json(responseBuilder(false, RESPONSE.FAILED));
                });
        }
    });
};

//@description     Delete customer
//@route           POST /v1/customer/delete/:id
//@access          Admin
export const deleteCustomer = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    } else {
        const _id = req.params.id;

        await Customer.findByIdAndDelete({ _id })
            .then((customer) => {
                if (customer) {
                    return res
                        .status(200)
                        .json(responseBuilder(true, RESPONSE.DELETED, {}, getAccessToken(user)));
                } else {
                    return res.status(200).json(responseBuilder(true, RESPONSE.NODATA));
                }
            })
            .catch((error: any) => {
                Logging.error(`Error while deleting the customer: ${error}`);
                return res.status(400).json(responseBuilder(false, RESPONSE.FAILED));
            });
    }
};

//@description     Update customer
//@route           POST /v1/customer/update/:id
//@access          Admin
export const updateCustomer = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    } else {
        const _id = req.params.id;
        await Customer.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        })
            .then((customer) => {
                if (customer) {
                    const data = {
                        _id: customer._id,
                        customerName: customer.customerName,
                        customerPhoneNumber: customer.customerPhoneNumber,
                        paymentDueDate: customer.paymentDueDate
                    };
                    return res
                        .status(201)
                        .json(responseBuilder(true, RESPONSE.UPDATE, data, getAccessToken(user)));
                } else {
                    Logging.error('Conflicting Data');
                    return res
                        .status(400)
                        .json(responseBuilder(false, RESPONSE.CONFLICT, {}, getAccessToken(user)));
                }
            })
            .catch((error: any) => {
                Logging.error(`Error while updating the customer: ${error}`);
                return res.status(400).json(responseBuilder(false, RESPONSE.FAILED));
            });
    }
};

//@description     Get or Search all customer
//@route           GET /v1/customer?search=
//@access          Admin
export const allCustomers = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    } else {
        const keyword = req.query.search
            ? {
                  $or: [
                      { customerName: { $regex: req.query.search, $options: 'i' } },
                      { customerPhoneNumber: { $regex: req.query.search, $options: 'i' } }
                  ]
              }
            : {};

        await Customer.find(keyword)
            .then((users) => {
                return res
                    .status(200)
                    .json(responseBuilder(true, RESPONSE.SUCCESS, users, getAccessToken(user)));
            })
            .catch((err) => {
                Logging.error('No Data ound');
                return res
                    .status(200)
                    .json(responseBuilder(false, RESPONSE.NODATA, {}, getAccessToken(user)));
            });
    }
};
