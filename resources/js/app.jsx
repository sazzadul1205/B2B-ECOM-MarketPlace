// app.jsx

// Bootstrap - Loads environment configuration and initial setup
import './bootstrap';
// Main CSS file - Imports global styles
import '../css/app.css';

// React DOM - For rendering React components to the DOM
import { createRoot } from 'react-dom/client';
// Inertia - Core Inertia functionality for React
import { createInertiaApp } from '@inertiajs/react';
// Vite Helper - Helps resolve page components dynamically
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// Get application name from environment variables, fallback to 'Laravel'
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Initialize Inertia application
createInertiaApp({
    // Page title configuration - Formats page titles
    title: (title) => `${title} - ${appName}`,

    // Page resolution - Dynamically loads page components
    // Searches in ./Pages/ directory for .jsx files matching the route name
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.jsx`,
        import.meta.glob('./Pages/**/*.jsx')
    ),

    // Setup function - Renders the application
    setup({ el, App, props }) {
        // Create React root and render the app
        const root = createRoot(el);
        root.render(<App {...props} />);
    },

    // Progress bar configuration - Shows loading progress during page navigation
    progress: {
        color: '#4B5563', // Gray-600 color for the progress bar
    },
});