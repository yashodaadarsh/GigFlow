import { useParams, useNavigate } from 'react-router-dom';

export default function ChatPlaceholder() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center text-indigo-600 mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Chat Interface</h2>
      <p className="text-gray-500 max-w-md mb-8">
        This is a placeholder for the real-time chat interface with Bidder #{id}. The Socket.io backend is ready to be connected!
      </p>
      <button onClick={() => navigate(-1)} className="text-indigo-600 font-bold hover:underline">
        ← Go Back
      </button>
    </div>
  )
}
