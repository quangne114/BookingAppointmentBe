import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    provider: {
      type: String,
      enum: ["vnpay", "paypal", "stripe", "momo"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);
const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
