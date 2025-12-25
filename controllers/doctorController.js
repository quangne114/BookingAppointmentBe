import Account from "../models/Account.js";
import Department from "../models/Department.js";
import Doctor from "../models/Doctor.js";
export const createDoctor = async(req, res) => {
    try {
        const newDoctor = await Doctor.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name, 
            gender: req.body.gender,
            phone_number: req.body.phone_number,
            date_of_birth: req.body.date_of_birth,
            account: req.body.account,
            avatar: req.body.avatar,
            department: req.body.department
        });
        res.status(201).json({
            message: "Tạo bác sĩ thành công",
            doctor: newDoctor
        });
    } catch (error) {
        console.error("Lỗi khi tạo bác sĩ", error);
        return res.status(500).json({ message: "Lỗi hệ thống!" });
    }
}