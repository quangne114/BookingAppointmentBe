import express from 'express';
import { createPaymentUrl, vnpayReturn, vnpayIpn } from '../controllers/paymentController.js';

export const paymentRouter = express.Router();

paymentRouter.post('/payments', createPaymentUrl)
paymentRouter.get('/vnpay_return', vnpayReturn)
paymentRouter.get('/vnpay_ipn', vnpayIpn);