import mongoose, { Schema, Document } from "mongoose";

export interface IBilling {
    startTime: Date;
    endTime: Date;
    count: Number;
    date: Date;
    rate: Number;
    jobType: 'JCB' | 'TRACTOR';
    tripType: 'HOURLY' | 'COUNT';
    customerId: string;
    amount: Number;
    status: 'CLOSED' | 'PENDING' | 'NOT_PAID';
}

export interface IBillingModel extends IBilling, Document { }

const BillingSchema: Schema = new Schema(
    {
        startTime: {
            type: Date,
            required: false,
            default: null,
        },
        endTime: {
            type: Date,
            required: false,
            default: null,
        },
        date: {
            type: Date,
            required: true,
        },
        rate: {
            type: Number,
            required: true,
            min: 0, // Ensure the rate is non-negative
        },
        count: {
            type: Number,
            required: false,
            default: null,
            min: 0, // Ensure the rate is non-negative
        },
        amount: {
            type: Number,
            required: true,
            min: 0, // Ensure the rate is non-negative
        },
        status: {
            type: String,
            enum: ['CLOSED', 'PENDING', 'NOT_PAID'], // Constrain to specific values
            required: true,
            default: 'NOT_PAID'
        },
        jobType: {
            type: String,
            enum: ['JCB', 'TRACTOR'], // Constrain to specific values
            required: true,
        },
        tripType: {
            type: String,
            enum: ['HOURLY', 'COUNT'], // Constrain to specific values
            required: true,
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

export default mongoose.model<IBillingModel>("Billing", BillingSchema);

