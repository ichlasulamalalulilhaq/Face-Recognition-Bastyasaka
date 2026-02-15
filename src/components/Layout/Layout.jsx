import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Toast from '../UI/Toast'
import LoadingOverlay from '../UI/LoadingOverlay'
import { useApp } from '../../context/AppContext'

export default function Layout() {
    const { toasts } = useApp()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
    const closeSidebar = () => setSidebarOpen(false)

    return (
        <>
            <div className="app-container">
                {/* Mobile Menu Button */}
                <button
                    className={`mobile-menu-btn ${sidebarOpen ? 'active' : ''}`}
                    onClick={toggleSidebar}
                    aria-label="Toggle Menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Sidebar Overlay */}
                <div
                    className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                    onClick={closeSidebar}
                />

                {/* Sidebar */}
                <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

                {/* Main Content */}
                <main className="main-content">
                    <Outlet />
                </main>
            </div>

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} />
                ))}
            </div>
        </>
    )
}
