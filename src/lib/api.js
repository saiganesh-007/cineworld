import { getAccessToken } from "./auth";

const API_ERROR_STATUS = 0;

export async function authenticatedFetch(path, options = {}) {
  const { token, error } = await getAccessToken();

  if (error || !token) {
    const authError = new Error("You must be logged in.");
    authError.status = 401;
    throw authError;
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetch(path, { ...options, headers });
  } catch (networkError) {
    const requestError = new Error(
      "Unable to connect to the server. Please try again."
    );
    requestError.status = API_ERROR_STATUS;
    throw requestError;
  }

  let data = null;

  const text = await response.text();

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const requestError = new Error(
      data?.message || "Request failed."
    );
    requestError.status = response.status;
    requestError.data = data;
    throw requestError;
  }

  return data;
}