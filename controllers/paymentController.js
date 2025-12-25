// paymentController.js (toàn bộ file, copy-paste thay hết)

import { VNPay, ignoreLogger, VnpLocale, dateFormat } from "vnpay";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";

// Khởi tạo VNPay một lần
const vnpay = new VNPay({
  tmnCode: process.env.VN_PAY_TMNCODE,
  secureSecret: process.env.VN_PAY_HASHSECRET,
  vnpayHost: process.env.VN_PAY_HOST,
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});

export const createPaymentUrl = async (req, res) => {
  try {
    if (!req.body?.appointmentId) {
      return res.status(400).json({ message: "Thiếu appointmentId" });
    }

    const txnRef = Date.now().toString();

    const appointment = await Appointment.findById(req.body.appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
    }

    const now = new Date();
    const expireDate = new Date(now);
    expireDate.setMinutes(expireDate.getMinutes() + 15);

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: appointment.price,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toán lịch khám - ID: ${appointment._id}`,
      vnp_ReturnUrl: "http://localhost:5000/api/payments/vnpay_return", // Tạm để vậy
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(now),
      vnp_ExpireDate: dateFormat(expireDate),
    });

    await Payment.create({
      appointmentId: appointment._id,
      amount: appointment.price,
      provider: "vnpay",
      status: "pending",
      txnRef: txnRef,
    });

    return res.status(201).json({ url: paymentUrl });
  } catch (error) {
    console.error("VNPAY CREATE ERROR:", error);
    return res.status(500).json({ message: "Lỗi tạo URL" });
  }
};

export const vnpayReturn = async (req, res) => {
  try {
    const verify = vnpay.verifyReturnUrl(req.query);

    console.log("RETURN VERIFY RESULT:", verify); // Xem kết quả verify

    if (verify.isSuccess && verify.isVerified) {
      await Payment.findOneAndUpdate(
        { txnRef: verify.vnp_TxnRef },
        { status: "successful" }
      );
      return res.send(`
        <h1 style="color: green; text-align: center;">THANH TOÁN THÀNH CÔNG!</h1>
        <p>TxnRef: ${verify.vnp_TxnRef}</p>
        <p>Số tiền: ${verify.vnp_Amount / 100} VNĐ</p>
        <p>Kiểm tra DB để thấy status = successful</p>
      `);
    } else {
      await Payment.findOneAndUpdate(
        { txnRef: verify.vnp_TxnRef },
        { status: "failed" }
      );
      return res.send(`
        <h1 style="color: red; text-align: center;">THANH TOÁN THẤT BẠI HOẶC BỊ HỦY</h1>
        <p>Mã lỗi: ${verify.vnp_ResponseCode}</p>
      `);
    }
  } catch (error) {
    console.error("RETURN ERROR:", error);
    return res.status(500).send("Lỗi xử lý return");
  }
};

export const vnpayIpn = async (req, res) => {
  try {
    // ĐỔI THÀNH req.query
   const verify = vnpay.verifyIpnCall(req.query);

    console.log("IPN NHẬN ĐƯỢC VÀ VERIFY:", verify); // Log này để kiểm tra

    if (verify.isSuccess && verify.isVerified) {
      const payment = await Payment.findOne({ txnRef: verify.vnp_TxnRef });

      // Kiểm tra amount khớp (VNPay gửi amount * 100)
      if (payment && payment.amount === verify.vnp_Amount / 100) {
        await Payment.findByIdAndUpdate(payment._id, { status: "successful" });

        console.log("IPN THÀNH CÔNG - ĐÃ CẬP NHẬT DB:", verify.vnp_TxnRef);

        return res.json({ RspCode: "00", Message: "Confirm Success" });
      }
    }

    // Các case fail
    return res.json({ RspCode: "02", Message: "Invalid" });
  } catch (error) {
    console.error("IPN ERROR:", error);
    return res.json({ RspCode: "99", Message: "Error" });
  }
};
