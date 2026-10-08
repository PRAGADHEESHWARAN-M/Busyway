import { Link } from 'react-router-dom';
import {
  Bus,
  MapPin,
  Clock,
  Radio,
  Satellite,
  Cpu,
  Cloud,
  Users,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      {/* HERO */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-14 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 bg-khaki-100 text-forest-600 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <Radio className="w-3.5 h-3.5" /> Real-time GPS bus tracking
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-forest-800 leading-tight mb-5">
            Track Your Bus. <br /> Plan Your Journey.
          </h1>
          <p className="text-forest-500 text-lg mb-8 max-w-md">
            Real-time smart bus tracking for faster, safer and stress-free travel.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/track"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-500 text-white font-bold shadow-soft hover:bg-forest-600 transition"
            >
              <MapPin className="w-4 h-4" /> Track Bus
            </Link>
            <Link
              to="/student/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-khaki-300 text-forest-700 font-bold hover:bg-khaki-100 transition"
            >
              Student Login
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cream-100 border border-khaki-200 text-forest-600 font-semibold hover:bg-khaki-100 transition"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Login
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="bg-white rounded-xl2 shadow-soft border border-khaki-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-forest-500 flex items-center justify-center">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-forest-800">BUS-01</p>
                  <p className="text-xs text-forest-400">BUSy Way Express</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-cream-100 rounded-lg p-3">
                <p className="text-forest-400 text-xs mb-1">Current Stop</p>
                <p className="font-semibold text-forest-800">College Main Gate</p>
              </div>
              <div className="bg-cream-100 rounded-lg p-3">
                <p className="text-forest-400 text-xs mb-1">Next Stop</p>
                <p className="font-semibold text-forest-800">Stop 2</p>
              </div>
              <div className="bg-cream-100 rounded-lg p-3">
                <p className="text-forest-400 text-xs mb-1">Distance</p>
                <p className="font-semibold text-forest-800">350 m</p>
              </div>
              <div className="bg-cream-100 rounded-lg p-3">
                <p className="text-forest-400 text-xs mb-1">ETA</p>
                <p className="font-semibold text-forest-800">2 min</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-khaki-200 rounded-full blur-2xl opacity-60 -z-10" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-khaki-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-800 text-center mb-3">How BUSy Way Works</h2>
          <p className="text-forest-500 text-center mb-12 max-w-xl mx-auto">
            A simple pipeline turns a GPS chip on the bus into a live map on your phone.
          </p>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Satellite, label: 'GPS' },
              { icon: Cpu, label: 'ESP32' },
              { icon: Radio, label: 'IoT' },
              { icon: Cloud, label: 'Cloud' },
              { icon: Bus, label: 'BUSy Way' },
              { icon: Users, label: 'Passenger' },
            ].map(({ icon: Icon, label }, i, arr) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-forest-50 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-forest-500" />
                  </div>
                  <p className="text-xs font-bold text-forest-700">{label}</p>
                </div>
                {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-khaki-300 hidden lg:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-800 text-center mb-3">Everything you need to catch your bus</h2>
        <p className="text-forest-500 text-center mb-12 max-w-xl mx-auto">
          Built for real commutes, not just a demo.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Radio,
              title: 'Real-Time Tracking',
              desc: 'The passenger dashboard refreshes automatically so you always see the bus\'s latest position.',
            },
            {
              icon: Satellite,
              title: 'GPS Location',
              desc: 'A NEO-6M GPS module on the bus reports precise latitude and longitude to the cloud.',
            },
            {
              icon: Clock,
              title: 'Estimated Arrival Time',
              desc: 'ETA is calculated honestly from live distance and speed - never a guessed number.',
            },
            {
              icon: MapPin,
              title: 'Smart Route Monitoring',
              desc: 'See every stop on the route, which ones are done, and which is coming up next.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl2 shadow-card border border-khaki-200 p-6 hover:shadow-soft transition">
              <div className="w-12 h-12 rounded-xl bg-khaki-100 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-forest-600" />
              </div>
              <h3 className="font-bold text-forest-800 mb-2">{title}</h3>
              <p className="text-sm text-forest-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-forest-50 py-16 border-y border-khaki-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-800 mb-4">About the Project</h2>
          <p className="text-forest-600 leading-relaxed">
            BUSy Way is a low-cost smart bus tracking system built for college and public transportation. A NEO-6M GPS
            module connected to an ESP32 microcontroller reads the bus's live location and sends it over the internet
            to a Node.js/Express backend, which stores it in MongoDB. This website reads that data and shows students
            the bus's current stop, next stop, distance and estimated arrival time - live, on any device. The system
            starts with a single bus but the database and architecture are designed to scale to a full fleet of buses
            and routes.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
