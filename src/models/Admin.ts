import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin {
    userId: string;
    password: string;
}

export interface IAdminModel extends IAdmin, Document { }

const AdminSchema: Schema = new Schema(
    {
        userId: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
    },
    {
        versionKey: false
    }
)

export default mongoose.model<IAdminModel>("Admin", AdminSchema);