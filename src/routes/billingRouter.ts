import express from 'express';
import { createBill, updateBill, allBills } from '../controllers/billingController';
import { checkAuthorization } from '../middleware/checkAuthorization';

const router = express.Router();

router.route('/create').post(checkAuthorization, createBill);
router.route('/update/:id').put(checkAuthorization, updateBill);
router.route('').get(checkAuthorization, allBills);

export default router;
