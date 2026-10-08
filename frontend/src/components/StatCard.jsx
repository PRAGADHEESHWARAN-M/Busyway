// Small dashboard statistic tile (e.g. "Total Buses: 3").
const StatCard = ({ icon: Icon, label, value, accent = 'forest' }) => {
  const accentMap = {
    forest: 'bg-forest-50 text-forest-600',
    orange: 'bg-orange-50 text-orange-600',
    khaki: 'bg-khaki-100 text-khaki-400',
  };
  return (
    <div className="bg-white rounded-xl2 shadow-card border border-khaki-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accentMap[accent] || accentMap.forest}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-forest-800 leading-tight">{value}</p>
        <p className="text-sm text-forest-500 font-medium">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
