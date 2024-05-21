import express from 'express';
import { createAdmin, deleteAdmin, LoginAdmin } from '../controllers/adminController';
import { checkAuthorization } from '../middleware/checkAuthorization';

const router = express.Router();

router.route('/register').post(checkAuthorization, createAdmin);
router.route('/delete/:id').delete(checkAuthorization, deleteAdmin);
router.route('/login').post(LoginAdmin);

export default router;
