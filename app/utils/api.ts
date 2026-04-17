export const adminFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("admin_token");

  const authenticatedOptions = {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(url, authenticatedOptions);

  // If the server returns 401, the session is likely expired
  if (response.status === 401) {
    localStorage.removeItem("admin_token");
    // This will trigger a redirect to your login page
    window.location.href = "/admin-login?expired=true";
    throw new Error("Unauthorized: Redirecting to login...");
  }

  return response;
};