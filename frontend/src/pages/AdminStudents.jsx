import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/students');
      setStudents(data.students);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student account?')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) return <Loader label="Loading students..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStudents} />;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-extrabold text-forest-800 mb-6">Registered Students</h1>
      <div className="bg-white rounded-xl2 shadow-card border border-khaki-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-forest-400 border-b border-khaki-200">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Roll No.</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Year</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b border-khaki-100 last:border-0">
                <td className="py-3 px-4 font-semibold text-forest-800">{s.name}</td>
                <td className="py-3 px-4">{s.rollNumber}</td>
                <td className="py-3 px-4">{s.email}</td>
                <td className="py-3 px-4">{s.department}</td>
                <td className="py-3 px-4">{s.year}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-forest-400">
                  No students have registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStudents;
