export const adminFetch = async (url: string, options: RequestInit = {}) => {
  // 1. Grab the token we saved during login
  const token = localStorage.getItem("admin_token");

  const authenticatedOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      // 2. Attach the token in the format the backend expects
      "Authorization": `Bearer ${token}`,
    },
  };

  const response = await fetch(url, authenticatedOptions);

  // 3. If the backend rejects the token (401), boot to login
  // if (response.status === 401) {
  //   console.warn("Unauthorized! Clearing token and redirecting...");
  //   localStorage.removeItem("admin_token");
  //   window.location.href = "/admin-login?expired=true";
  //   throw new Error("Session expired. Please log in again.");
  // }
  // Look for this in your api.ts utility
  if (response.status === 401) {
    // localStorage.removeItem("admin_token"); // Comment this out
    // window.location.href = "/admin-login?expired=true"; // Comment this out
    console.error("Backend returned 401 Unauthorized");
  }

  return response;
};