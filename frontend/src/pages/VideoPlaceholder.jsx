import { useParams, useNavigate } from 'react-router-dom';

export default function VideoPlaceholder() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-pink-50 w-20 h-20 rounded-full flex items-center justify-center text-pink-600 mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4">WebRTC Video Call</h2>
      <p className="text-gray-500 max-w-md mb-8">
        This is a placeholder for the WebRTC video call with Bidder #{id}. WebRTC signaling is established in the new Node.js service!
      </p>
      <button onClick={() => navigate(-1)} className="text-pink-600 font-bold hover:underline">
        ← Go Back
      </button>
    </div>
  )
}
