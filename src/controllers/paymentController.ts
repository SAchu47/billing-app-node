import { NextFunction, Request, Response } from 'express';
import Payment, { IPayment } from '../models/Payment';
import Billing, { IBilling } from '../models/Billing';
import responseBuilder from '../config/responseBuilder';
import { RESPONSE } from '../config/constantResponse';
import Logging from '../config/consoleLogging';
import { getAccessToken } from '../config/auth';
import { CustomRequest } from '../middleware/checkAuthorization';

interface IPaymentBilling extends IBilling {
    _id: string;
}

const generateBills = (
    amount: number,
    customerId: string,
    bills: IPaymentBilling[]
): IPayment[] => {
    let paymentBills: IPayment[] = [];
    bills.forEach((bill) => {
        if (amount > 0 && bill.amount >= amount) {
            let newPayment: IPayment = {
                amount: amount,
                customerId: customerId,
                billId: bill._id
            };
            amount = 0;
            paymentBills.push(newPayment);
        } else if (bill.amount < amount && amount > 0) {
            let newPayment: IPayment = {
                amount: bill.amount,
                customerId: customerId,
                billId: bill._id
            };
            amount -= bill.amount;
            paymentBills.push(newPayment);
        }
    });
    return paymentBills;
};

//@description     create customer
//@route           POST /v1/customer/register
//@access          Admin
export const createPayment = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    }

    const { customerId, amount } = req.body;

    await Billing.find({
        $and: [{ customerId: customerId }, { status: { $ne: 'CLOSED' } }]
    })
        .sort({ date: 1 })
        .then(async (billExists) => {
            if (!billExists.length) {
                Logging.error('No Bill exists');
                return res.status(400).json(responseBuilder(false, RESPONSE.MISSING));
            } else {
                // Create a new payments
                const paymentBills = generateBills(
                    amount,
                    customerId,
                    billExists as unknown as IPaymentBilling[]
                );
                await Payment.insertMany(paymentBills)
                    .then((payments) => {
                        if (payments) {
                            const data = payments;
                            return res
                                .status(201)
                                .json(
                                    responseBuilder(
                                        true,
                                        RESPONSE.CREATED,
                                        data,
                                        getAccessToken(user)
                                    )
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

//@description     Get all payments
//@route           GET /v1/payment?search=
//@access          Admin
export const allPayments = async (req: Request, res: Response, _next: NextFunction) => {
    const customReq = req as CustomRequest;

    // Access the accessToken and user from the request object
    const user = customReq.user;

    // Check if the user has admin permissions
    if (!user.isAdmin) {
        return res.status(403).json(responseBuilder(false, RESPONSE.NOPERMISSION));
    } else {
        const keyword = req.query.search
            ? {
                  $or: [{ customerId: req.query.search }, { billId: req.query.search }]
              }
            : {};

        await Payment.find(keyword)
            .populate('customerId')
            .populate('billId')
            .then((payment) => {
                return res
                    .status(200)
                    .json(responseBuilder(true, RESPONSE.SUCCESS, payment, getAccessToken(user)));
            })
            .catch((err) => {
                Logging.error('No Data ound');
                return res
                    .status(200)
                    .json(responseBuilder(false, RESPONSE.NODATA, {}, getAccessToken(user)));
            });
    }
};
