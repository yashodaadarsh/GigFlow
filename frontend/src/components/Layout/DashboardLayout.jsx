import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';

export default function DashboardLayout({ children }) {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
      <Sidebar role={user?.role} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
