export const adminFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("admin_token");

  // If there's no token at all, redirect immediately
  if (!token) {
    window.location.href = "/admin-login";
    throw new Error("No token found.");
  }

  const authenticatedOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      "Authorization": `Bearer ${token}`,
    },
  };

  const response = await fetch(url, authenticatedOptions);

  if (response.status === 401) {
    console.error("Backend returned 401 — clearing token and redirecting.");
    localStorage.removeItem("admin_token");
    window.location.href = "/admin-login?expired=true";
    throw new Error("Session expired.");
  }

  return response;
};