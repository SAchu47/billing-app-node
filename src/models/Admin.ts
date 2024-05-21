import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { required } from 'joi';

export interface IAdmin {
    userId: string;
    password: string;
    isAdmin: Boolean;
}

export interface IAdminModel extends IAdmin, Document {
    matchPassword(enteredPassword: string): Promise<boolean>;
}

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
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    {
        versionKey: false
    }
);

AdminSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

AdminSchema.pre<IAdminModel>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        throw new Error('Creation failed');
    }
});

// Export the Admin model
const Admin = mongoose.model<IAdminModel>('Admin', AdminSchema);
export default Admin;
