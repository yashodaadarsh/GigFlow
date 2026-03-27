import { useNavigate } from 'react-router-dom';

export default function MyPostedGigs({ gigs }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {gigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
           <p className="text-gray-400 font-medium">You haven't posted any gigs yet.</p>
        </div>
      ) : (
        gigs.map(gig => (
          <div 
            key={gig.id} 
            onClick={() => navigate(`/dashboard/gig/${gig.id}`)}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{gig.title}</h4>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     gig.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                   }`}>
                     {gig.status}
                   </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{gig.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {gig.skillsRequired?.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="text-right ml-6 flex flex-col items-end gap-2">
                <div className="text-2xl font-black text-gray-900">${gig.budget}</div>
                <p className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">Manage Bids →</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
