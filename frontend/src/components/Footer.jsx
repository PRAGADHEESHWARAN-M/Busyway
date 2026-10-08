import { Bus } from 'lucide-react';

const Footer = () => (
  <footer className="bg-forest-700 text-cream-100 mt-20">
    <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bus className="w-5 h-5" />
          <span className="font-extrabold text-lg">BUSy Way</span>
        </div>
        <p className="text-sm text-khaki-200 max-w-xs">
          A low-cost smart bus tracking system built with NEO-6M GPS, ESP32 and a modern web stack.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-cream-50">Architecture</h4>
        <p className="text-sm text-khaki-200">GPS → ESP32 → Internet → Backend → Database → BUSy Way → Passenger</p>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-cream-50">Project</h4>
        <p className="text-sm text-khaki-200">Final-year academic project. Built for one bus, designed to scale to a full fleet.</p>
      </div>
    </div>
    <div className="border-t border-forest-600 text-center text-xs text-khaki-200 py-4">
      &copy; {new Date().getFullYear()} BUSy Way. All rights reserved.
    </div>
  </footer>
);

export default Footer;
