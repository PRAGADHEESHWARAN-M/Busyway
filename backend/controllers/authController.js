// Handles student signup/login and admin login. Two separate auth flows
// keep passenger and admin credentials fully isolated from one another.
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

const sanitizeStudent = (student) => ({
  id: student._id,
  name: student.name,
  rollNumber: student.rollNumber,
  email: student.email,
  phone: student.phone,
  department: student.department,
  year: student.year,
});

const sanitizeAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
});

// @route POST /api/auth/student/signup
const studentSignup = async (req, res, next) => {
  try {
    const { name, rollNumber, email, password, phone, department, year } = req.body;

    if (!name || !rollNumber || !email || !password || !phone || !department || !year) {
      const err = new Error('All fields are required.');
      err.statusCode = 400;
      throw err;
    }

    const existing = await Student.findOne({
      $or: [{ email: email.toLowerCase() }, { rollNumber: rollNumber.toUpperCase() }],
    });
    if (existing) {
      const err = new Error('A student with this email or roll number already exists.');
      err.statusCode = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await Student.create({
      name,
      rollNumber: rollNumber.toUpperCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      department,
      year,
    });

    const token = generateToken(student._id, 'student');
    res.status(201).json({ success: true, token, user: sanitizeStudent(student), role: 'student' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/student/login
const studentLogin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier = roll number OR email

    if (!identifier || !password) {
      const err = new Error('Roll number/email and password are required.');
      err.statusCode = 400;
      throw err;
    }

    const student = await Student.findOne({
      $or: [{ email: identifier.toLowerCase() }, { rollNumber: identifier.toUpperCase() }],
    });

    if (!student || !(await bcrypt.compare(password, student.password))) {
      const err = new Error('Invalid credentials.');
      err.statusCode = 401;
      throw err;
    }

    const token = generateToken(student._id, 'student');
    res.json({ success: true, token, user: sanitizeStudent(student), role: 'student' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/admin/login
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email and password are required.');
      err.statusCode = 400;
      throw err;
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      const err = new Error('Invalid admin credentials.');
      err.statusCode = 401;
      throw err;
    }

    const token = generateToken(admin._id, 'admin');
    res.json({ success: true, token, user: sanitizeAdmin(admin), role: 'admin' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me  (works for either role, protected)
const getMe = async (req, res, next) => {
  try {
    if (req.role === 'admin') {
      return res.json({ success: true, role: 'admin', user: sanitizeAdmin(req.user) });
    }
    res.json({ success: true, role: 'student', user: sanitizeStudent(req.user) });
  } catch (error) {
    next(error);
  }
};

module.exports = { studentSignup, studentLogin, adminLogin, getMe };
