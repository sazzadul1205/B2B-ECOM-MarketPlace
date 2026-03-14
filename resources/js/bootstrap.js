// resources/js/bootstrap.js

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

// Axios - HTTP client for making API requests
import axios from "axios";
window.axios = axios;

// Set default headers for all axios requests
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// Echo - Laravel's event broadcasting library for real-time features
import Echo from "laravel-echo";

// Pusher - WebSocket client for real-time connections
import Pusher from "pusher-js";
window.Pusher = Pusher;

// Initialize Echo with Pusher configuration
window.Echo = new Echo({
    // Use Pusher as the broadcasting driver
    broadcaster: "pusher",

    // Application credentials from environment variables
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "mt1",

    // WebSocket connection configuration
    wsHost: import.meta.env.VITE_PUSHER_HOST
        ? import.meta.env.VITE_PUSHER_HOST
        : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
    wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
    wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,

    // Use TLS/SSL if scheme is https
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? "https") === "https",

    // Enable both ws and wss transports
    enabledTransports: ["ws", "wss"],
});
