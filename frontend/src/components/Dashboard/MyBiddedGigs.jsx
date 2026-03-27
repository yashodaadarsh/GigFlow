import { useNavigate } from 'react-router-dom';

export default function MyBiddedGigs({ biddedGigs, filter = 'ALL' }) {
  const navigate = useNavigate();

  const statusColors = {
    PENDING:     'bg-yellow-100 text-yellow-800 border-yellow-200',
    SHORTLISTED: 'bg-blue-100 text-blue-800 border-blue-200',
    ACCEPTED:    'bg-green-100 text-green-800 border-green-200',
    REJECTED:    'bg-red-100 text-red-700 border-red-200',
    ONGOING:     'bg-indigo-100 text-indigo-800 border-indigo-200',
    COMPLETED:   'bg-gray-100 text-gray-700 border-gray-200',
    ASSIGNED:    'bg-indigo-100 text-indigo-800 border-indigo-200',
    HIRED:       'bg-green-100 text-green-800 border-green-200',
  };

  const statusIcons = {
    PENDING: '⏳', SHORTLISTED: '⭐', ACCEPTED: '✅',
    REJECTED: '❌', ONGOING: '🚀', COMPLETED: '🏁',
    ASSIGNED: '📌', HIRED: '🎉'
  };

  const filteredGigs = biddedGigs.filter(gig => {
    if (filter === 'ALL') return true;
    if (filter === 'OPEN') return gig.status === 'OPEN';
    return gig.status === filter;
  });

  return (
    <div className="space-y-4">
      {filteredGigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
           <p className="text-gray-400 font-medium">No gigs found for this filter.</p>
        </div>
      ) : (
        filteredGigs.map(gig => {
          const statusClass = statusColors[gig.status] || 'bg-gray-100 text-gray-600 border-gray-200';
          return (
            <div key={gig.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{gig.title}</h4>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{gig.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {gig.skillsRequired?.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-6 flex flex-col items-end gap-3">
                  <div className="text-2xl font-black text-emerald-600">${gig.budget}</div>
                  <span className={`border text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${statusClass}`}>
                    {statusIcons[gig.status] || '📋'} {gig.status || 'UNKNOWN'}
                  </span>
                  
                  {['ACCEPTED', 'ONGOING', 'ASSIGNED', 'COMPLETED', 'PAYMENT_PENDING', 'DELIVERED', 'HIRED'].includes(gig.status) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/project/${gig.id}`)}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl font-bold transition flex items-center gap-2"
                      >
                        📈 Pipeline
                      </button>
                      {gig.hirerId && (
                        <button
                          onClick={() => navigate(`/chat/${gig.hirerId}`)}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition shadow-lg shadow-indigo-100"
                        >
                          Chat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
