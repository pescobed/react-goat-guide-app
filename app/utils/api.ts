export const adminFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("admin_token");

  // Dynamically set headers without overriding multi-part form data headers
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle expired, invalid, or missing token errors from backend
  if (response.status === 401) {
    console.warn("Backend returned 401 — clearing token and redirecting.");
    localStorage.removeItem("admin_token");
    
    // Avoid page reload if user is already on the login page
    if (!window.location.pathname.startsWith("/admin-login")) {
      window.location.href = "/admin-login?expired=true";
    }
    throw new Error("Session expired.");
  }

  return response;
};