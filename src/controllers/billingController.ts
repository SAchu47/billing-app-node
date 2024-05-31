import { NextFunction, Request, Response } from 'express';
import Billing from '../models/Billing';
import responseBuilder from '../config/responseBuilder';
import { RESPONSE } from '../config/constantResponse';
import Logging from '../config/consoleLogging';
import { getAccessToken } from '../config/auth';
import { CustomRequest } from '../middleware/checkAuthorization';

const calculateAmountHourly = (rate: number, startTime: Date, endTime: Date): number => {
    // Calculate the difference in milliseconds
    endTime = new Date(endTime);
    startTime = new Date(startTime);
    const totalTimeMs = endTime.getTime() - startTime.getTime();

    // Convert milliseconds to minutes
    const totalTimeMinutes = totalTimeMs / (1000 * 60);

    // Calculate the total amount based on hours
    const totalAmount = rate * (totalTimeMinutes / 60);

    return totalAmount;
};

const calculateAmountCount = (rate: number, count: number): number => {
    return rate * count;
};

//@description     create customer
//@route           POST /v1/bill/create
//@access          Admin
export const createBill = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    }

    const { jobType, tripType } = req.body;

    if (tripType === 'HOURLY') {
        const { startTime, endTime, rate, date, customerId } = req.body;
        const amount = calculateAmountHourly(rate, startTime, endTime);
        const amountPending = amount;
        // Create a new admin
        await Billing.create({
            startTime,
            endTime,
            rate,
            date,
            customerId,
            jobType,
            tripType,
            amount,
            amountPending
        })
            .then((bill) => {
                if (bill) {
                    return res
                        .status(201)
                        .json(responseBuilder(true, RESPONSE.CREATED, bill, getAccessToken(user)));
                } else {
                    Logging.error('Billing not done');
                    return res
                        .status(400)
                        .json(responseBuilder(false, RESPONSE.FAILED, {}, getAccessToken(user)));
                }
            })
            .catch((error: any) => {
                Logging.error(`Error while creating the bill: ${error}`);
                return res
                    .status(400)
                    .json(responseBuilder(false, RESPONSE.FAILED, {}, getAccessToken(user)));
            });
    } else if (tripType === 'COUNT') {
        const { rate, date, customerId, count } = req.body;
        const amount = calculateAmountCount(rate, count);
        const amountPending = amount;
        // Create a new admin
        await Billing.create({
            rate,
            date,
            customerId,
            jobType,
            tripType,
            count,
            amount,
            amountPending
        })
            .then((bill) => {
                if (bill) {
                    return res
                        .status(201)
                        .json(responseBuilder(true, RESPONSE.CREATED, bill, getAccessToken(user)));
                } else {
                    Logging.error('Billing not done');
                    return res
                        .status(400)
                        .json(responseBuilder(false, RESPONSE.FAILED, {}, getAccessToken(user)));
                }
            })
            .catch((error: any) => {
                Logging.error(`Error while creating the bill: ${error}`);
                return res
                    .status(400)
                    .json(responseBuilder(false, RESPONSE.FAILED, {}, getAccessToken(user)));
            });
    } else {
        Logging.error(`No such trip type found`);
        return res
            .status(400)
            .json(responseBuilder(false, RESPONSE.FAILED, {}, getAccessToken(user)));
    }
};

//@description     create customer
//@route           POST /v1/bill/update/:id
//@access          Admin
export const updateBill = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    }

    const { jobType, tripType } = req.body;
    const _id = req.params.id;

    if (tripType === 'HOURLY') {
        const { startTime, endTime, rate, date, customerId, amountPending, amount, status } =
            req.body;
        const amountUpdated = calculateAmountHourly(rate, startTime, endTime);
        let amountPendingUpdated = amountPending;
        if (status === 'NOT_PAID') {
            amountPendingUpdated = amountUpdated;
        } else {
            if (amount < amountUpdated) {
                amountPendingUpdated = amountPending + (amountUpdated - amount);
            } else {
                amountPendingUpdated = amountPending - (amount - amountUpdated);
            }
        }
        // Create a new admin
        await Billing.findByIdAndUpdate(
            _id,
            {
                startTime,
                endTime,
                rate,
                date,
                customerId,
                jobType,
                tripType,
                amount: amountUpdated,
                amountPending: amountPendingUpdated
            },
            {
                new: true
            }
        )
            .then((bill) => {
                if (bill) {
                    return res
                        .status(201)
                        .json(responseBuilder(true, RESPONSE.UPDATE, bill, getAccessToken(user)));
                } else {
                    Logging.error('Bill update not done');
                    return res
                        .status(400)
                        .json(responseBuilder(false, RESPONSE.FAILED, {}, getAccessToken(user)));
                }
            })
            .catch((error: any) => {
                Logging.error(`Error while updating the bill: ${error}`);
                return res
                    .status(400)
                    .json(responseBuilder(false, RESPONSE.FAILED, {}, getAccessToken(user)));
            });
    } else if (tripType === 'COUNT') {
        const { rate, date, customerId, count, amountPending, amount, status } = req.body;
        const amountUpdated = calculateAmountCount(rate, count);
        let amountPendingUpdated = amountPending;
        if (status === 'NOT_PAID') {
            amountPendingUpdated = amountUpdated;
        } else {
            if (amount < amountUpdated) {
                amountPendingUpdated = amountPending + (amountUpdated - amount);
            } else {
                amountPendingUpdated = amountPending - (amount - amountUpdated);
            }
        }
        // Create a new admin
        await Billing.findByIdAndUpdate(
            _id,
            {
                rate,
                date,
                customerId,
                jobType,
                tripType,
                count,
                amount: amountUpdated,
                amountPending: amountPendingUpdated
            },
            {
                new: true
            }
        )
            .then((bill) => {
                if (bill) {
                    return res
                        .status(201)
                        .json(responseBuilder(true, RESPONSE.UPDATE, bill, getAccessToken(user)));
                } else {
                    Logging.error('Billing not done');
                    return res
                        .status(400)
                        .json(responseBuilder(false, RESPONSE.FAILED, {}, getAccessToken(user)));
                }
            })
            .catch((error: any) => {
                Logging.error(`Error while updating the bill: ${error}`);
                return res
                    .status(400)
                    .json(responseBuilder(false, RESPONSE.FAILED, {}, getAccessToken(user)));
            });
    } else {
        Logging.error(`No such trip type found`);
        return res
            .status(400)
            .json(responseBuilder(false, RESPONSE.FAILED, {}, getAccessToken(user)));
    }
};

//@description     Get all bills
//@route           GET /v1/bill?search=
//@access          Admin
export const allBills = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    } else {
        const keyword = req.query.search
            ? {
                  customerId: req.query.search
              }
            : {};

        await Billing.find(keyword)
            .populate('customerId')
            .then((bills) => {
                return res
                    .status(200)
                    .json(responseBuilder(true, RESPONSE.SUCCESS, bills, getAccessToken(user)));
            })
            .catch((err) => {
                Logging.error('No Data ound');
                return res
                    .status(200)
                    .json(responseBuilder(false, RESPONSE.NODATA, {}, getAccessToken(user)));
            });
    }
};
