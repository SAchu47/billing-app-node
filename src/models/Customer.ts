import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer {
    customerName: string;
    customerPhoneNumber: string;
    paymentDueDate: Date;
}

export interface ICustomerModel extends ICustomer, Document { }

const CustomerSchema: Schema = new Schema(
    {
        customerName: {
            type: String,
            required: true
        },
        customerPhoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
        },
        paymentDueDate: {
            type: Date,
            required: true
        }
    },
    {
        versionKey: false,
    }
);

export default mongoose.model<ICustomerModel>('Customer', CustomerSchema);
