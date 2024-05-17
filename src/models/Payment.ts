import mongoose, { Schema, Document } from "mongoose";

export interface IPayment {
    amount: Number;
    billId: string;
    customerId: string;
}

export interface IPaymentModel extends IPayment, Document { }

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
        versionKey: false
    }
)

export default mongoose.model<IPaymentModel>("Payment", PaymentSchema);