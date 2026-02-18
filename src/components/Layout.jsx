import { useState } from 'react'; // Import useState
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import clsx from 'clsx';
import Chatbot from './Chatbot/Chatbot'; // Import clsx

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-black via-zinc-950 to-violet-950 text-slate-100">
            <div className="pointer-events-none fixed inset-0 opacity-40">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-fuchsia-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative flex">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                <div
                    className={clsx(
                        'flex-1 flex flex-col transition-all duration-300 ease-in-out',
                        isSidebarOpen ? 'ml-64' : 'ml-20'
                    )}
                >
                    <Header />
                    <main className="flex-1 p-6 overflow-auto">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
            <Chatbot />
        </div>
    );
};

export default Layout;
