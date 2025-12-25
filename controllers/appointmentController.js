import Appointment from "../models/Appointment.js"
import Schedule from "../models/Schedule.js"
export const createAppointment = async(req, res) => {
    try {
        const {startTime, endTime, doctorId, date} = req.body
        const schedule = await Schedule.create({
            startTime, 
            endTime, 
            doctorId,
            date
        })

        const {id} = req.params
        const appointment = await Appointment.create({
            scheduleId: schedule._id,
            medicalForm: id,
        })

        res.status(201).json({message: "Đặt lịch thành công", appointment})
    } catch (error) {
        console.error("Lỗi đăng ký lịch khám", error); 
        return res.status(500).json("Server lỗi")
    }
}