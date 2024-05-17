import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Admin from '../models/Admin';

const createAdmin = (req: Request, res: Response, next: NextFunction) => {
    const { userId, password } = req.body;

    const admin = new Admin({
        _id: new mongoose.Types.ObjectId(),
        userId,
        password
    });

    return admin
        .save()
        .then((admin) => res.status(201).json({ admin }))
        .catch((error) => res.status(500).json({ error }));
};

const deleteAdmin = (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.params.adminId;

    return Admin.findByIdAndDelete(adminId)
        .then((admin) => (admin ? res.status(201).json({ admin, message: 'Deleted' }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }));
};

export default { createAdmin, deleteAdmin };