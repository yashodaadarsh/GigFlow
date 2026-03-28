import Navbar from '../Navbar';
import Footer from "../../components/Footer"

export default function DesktopLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full px-4 md:px-8 gap-8 mt-24 mb-12">
        <main className="flex-1 w-full min-w-0">
          <div className="glass-card p-1 md:p-8 min-h-[70vh]">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
