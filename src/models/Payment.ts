import mongoose, { Schema, Document } from 'mongoose';
import Billing from './Billing';

export interface IPayment {
    amount: number;
    billId: string;
    customerId: string;
}

export interface IPaymentModel extends IPayment, Document {}

const PaymentSchema: Schema = new Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        billId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Billing'
        },
        customerId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Customer'
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

// Middleware to update billing status and amount
PaymentSchema.post<IPaymentModel[]>('insertMany', async function (payments) {
    for (const payment of payments) {
        try {
            const billing = await Billing.findById(payment.billId);
            if (billing) {
                billing.amountPending = billing.amountPending - payment.amount;
                if (billing.amountPending === 0) {
                    billing.status = 'CLOSED';
                } else if (billing.amountPending > 0) {
                    billing.status = 'PENDING';
                }
                await billing.save();
            }
        } catch (error) {
            console.log(error);
        }
    }
});

export default mongoose.model<IPaymentModel>('Payment', PaymentSchema);
