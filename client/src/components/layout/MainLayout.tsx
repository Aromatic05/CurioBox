import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-6 py-8">
                <Outlet />
            </main>
            <footer className="footer-theme text-center py-4">
                © 2025 CurioBox Project.
            </footer>
        </div>
    );
}
export default MainLayout;