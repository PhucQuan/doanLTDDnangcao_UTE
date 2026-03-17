const { body, validationResult } = require('express-validator');

const validateRegister = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .isLength({ min: 10, max: 10 }).withMessage('Số điện thoại phải có 10 số')
        .matches(/^0[0-9]{9}$/).withMessage('Số điện thoại phải bắt đầu bằng số 0'),
    body('password')
        .trim()
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('name')
        .trim()
        .notEmpty().withMessage('Tên không được để trống')
        .isLength({ min: 2 }).withMessage('Tên phải có ít nhất 2 ký tự'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Email không hợp lệ')
];

const validateLogin = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .matches(/^0[0-9]{9}$/).withMessage('Số điện thoại không hợp lệ'),
    body('password')
        .trim()
        .notEmpty().withMessage('Mật khẩu không được để trống')
];

const validateForgotPassword = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .matches(/^0[0-9]{9}$/).withMessage('Số điện thoại không hợp lệ')
];

const validateResetPassword = [
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống'),
    body('newPassword')
        .trim()
        .notEmpty().withMessage('Mật khẩu mới không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
    body('token')
        .notEmpty().withMessage('Token không được để trống')
];

const validateUpdateProfile = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên không được để trống')
        .isLength({ min: 2 }).withMessage('Tên phải có ít nhất 2 ký tự'),
    body('avatar')
        .optional()
        .trim()
];

const validateChangePassword = [
    body('oldPassword')
        .notEmpty().withMessage('Mật khẩu cũ không được để trống'),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
];

const validateChangeContact = [
    body('newValue')
        .trim()
        .notEmpty().withMessage('Giá trị mới không được để trống')
];

// Validation middleware executor
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        console.log(`[VALIDATION ERROR] ${req.path}: ${firstError.msg}`);
        return res.status(400).json({
            success: false,
            message: firstError.msg,
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateUpdateProfile,
    validateChangePassword,
    validateChangeContact,
    validate
};
