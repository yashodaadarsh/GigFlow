import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';

export default function DashboardLayout({ children }) {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      <Sidebar role={user?.role} />
      <main className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
