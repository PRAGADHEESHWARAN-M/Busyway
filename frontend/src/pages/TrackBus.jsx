import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StudentTrackContent from './StudentTrack';

// Public "Track Bus" page reachable from the landing page without logging
// in. Reuses the same live-map content as the student /track page, wrapped
// in the public Navbar/Footer instead of the student layout.
const TrackBus = () => (
  <div className="min-h-screen flex flex-col bg-cream-50">
    <Navbar />
    <main className="flex-1 px-4 sm:px-6 py-8">
      <StudentTrackContent />
    </main>
    <Footer />
  </div>
);

export default TrackBus;
