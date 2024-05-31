import express from 'express';
import { createPayment, allPayments } from '../controllers/paymentController';
import { checkAuthorization } from '../middleware/checkAuthorization';

const router = express.Router();

router.route('/create').post(checkAuthorization, createPayment);
router.route('').get(checkAuthorization, allPayments);

export default router;
