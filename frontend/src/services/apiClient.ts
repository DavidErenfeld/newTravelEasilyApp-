import axios, {
  CanceledError,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from "axios";

export { CanceledError };

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean;
  _retry?: boolean;
}

let isTokenRefreshing: boolean = false;
let subscribers: ((accessToken: string) => void)[] = [];

function onTokenRefreshed(accessToken: string): void {
  subscribers.forEach((callback) => callback(accessToken));
  subscribers = [];
}

function addSubscriber(callback: (accessToken: string) => void): void {
  subscribers.push(callback);
}

export const apiClient = axios.create({
  baseURL: "https://evening-bayou-77034-176dc93fb1e1.herokuapp.com",
});

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.log("No refresh token available, login required.");
    throw new Error("No refresh token available. Login required.");
  }

  try {
    console.log("Sending request to refresh access token...");

    // העברת ה-refresh token ב-Authorization Header
    const response: AxiosResponse = await axios.post(
      `${apiClient.defaults.baseURL}/auth/refresh`,
      {}, // גוף ריק
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`, // שליחת ה-refresh token ב-Header
        },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    console.log("New tokens received:", { accessToken, newRefreshToken });

    // עדכון ה-Access Token וה-Refresh Token
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    apiClient.defaults.headers.common["Authorization"] = `JWT ${accessToken}`;

    onTokenRefreshed(accessToken);
    return accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    alert("Session expired, please log in again.");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    throw new Error("Failed to refresh token, login required.");
  }
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (originalRequest?.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isTokenRefreshing) {
        isTokenRefreshing = true;
        originalRequest._retry = true;

        try {
          const accessToken = await refreshAccessToken();
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `JWT ${accessToken}`;
          if (originalRequest.headers)
            originalRequest.headers["Authorization"] = `JWT ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("Error in token refresh", refreshError);
          return Promise.reject(refreshError);
        } finally {
          isTokenRefreshing = false;
        }
      } else {
        return new Promise((resolve) => {
          addSubscriber((accessToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `JWT ${accessToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
