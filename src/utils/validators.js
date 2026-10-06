/**
 * Utility Validators for Student Registration & Profile Updates
 * Matched 1:1 with frontend/student/src/utils/validators.js
 */

export const validateStudentNo = (no) => /^(23|24|25|26)\d{5,6}$/.test(no?.toString().trim());

export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone?.toString().trim());

export const validateEmail = (email) => email?.toString().trim().toLowerCase().endsWith('@akgec.ac.in');

export const validateRoomNumber = (roomNo) => /^(?:[1-6]\d{2}|700)$/.test(roomNo?.toString().trim());
