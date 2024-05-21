import express from 'express';
import {
    createCustomer,
    updateCustomer,
    allCustomers,
    deleteCustomer
} from '../controllers/customerController';
import { checkAuthorization } from '../middleware/checkAuthorization';

const router = express.Router();

router.route('/register').post(checkAuthorization, createCustomer);
router.route('/delete/:id').delete(checkAuthorization, deleteCustomer);
router.route('/update/:id').put(checkAuthorization, updateCustomer);
router.route('').get(checkAuthorization, allCustomers);

export default router;
