// Seeds the database with demo data:
// one admin, one student, one bus (BUS-01), one route, and its stops.
// Run with: npm run seed  (from /backend)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Bus = require('./models/Bus');
const Route = require('./models/Route');
const Stop = require('./models/Stop');
const BusLocation = require('./models/BusLocation');

// The required BUS-01 route. Do not change these coordinates.
const STOP_POINTS = [
  { name: 'Stop 1', latitude: 9.672833, longitude: 77.965611 },
  { name: 'Stop 2', latitude: 9.673528, longitude: 77.965472 },
  { name: 'Stop 3', latitude: 9.673417, longitude: 77.964222 },
];

const seed = async () => {
  await connectDB();

  console.log('Clearing existing demo collections...');
  await Promise.all([
    Admin.deleteMany({}),
    Student.deleteMany({}),
    Bus.deleteMany({}),
    Route.deleteMany({}),
    Stop.deleteMany({}),
    BusLocation.deleteMany({}),
  ]);

  console.log('Creating admin account...');
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  await Admin.create({
    name: 'BUSy Way Admin',
    email: 'admin@busyway.com',
    password: adminPasswordHash,
    role: 'superadmin',
  });

  console.log('Creating student account...');
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);
  await Student.create({
    name: 'Demo Student',
    rollNumber: 'CSE2023001',
    email: 'student@busyway.com',
    password: studentPasswordHash,
    phone: '9876543210',
    department: 'Computer Science',
    year: '3rd Year',
  });

  console.log('Creating route...');
  const route = await Route.create({
    name: 'Route 1 - City to College',
    startingPoint: STOP_POINTS[0].name,
    destination: STOP_POINTS[STOP_POINTS.length - 1].name,
  });

  console.log('Creating stops...');
  const stops = await Stop.insertMany(
    STOP_POINTS.map((p, index) => ({
      name: p.name,
      latitude: p.latitude,
      longitude: p.longitude,
      order: index + 1,
      route: route._id,
    }))
  );

  console.log('Creating bus BUS-01...');
  const bus = await Bus.create({
    busNumber: 'BUS-01',
    busName: 'BUSy Way Express',
    registrationNumber: 'TN-58-AB-1234',
    route: route._id,
    status: 'active',
  });

  console.log('Creating initial bus location...');
  await BusLocation.create({
    bus: bus._id,
    latitude: stops[0].latitude,
    longitude: stops[0].longitude,
    speed: 0,
    satellites: 8,
    source: 'gps',
    timestamp: new Date(),
  });

  console.log('\nSeed complete!\n');
  console.log('Admin login    -> email: admin@busyway.com   password: Admin@123');
  console.log('Student login  -> roll: CSE2023001 (or email student@busyway.com)  password: Student@123');
  console.log(`Bus ID: ${bus._id}`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
