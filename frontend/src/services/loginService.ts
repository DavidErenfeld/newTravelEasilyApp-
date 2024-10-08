import { apiClient } from "./apiClient";
import { IUser } from "./registerService";
import { AxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean; // מוסיפים את skipAuthRefresh כסוג אופציונלי
}

export const loginUser = (user: IUser) => {
  return new Promise<IUser>((resolve, reject) => {
    console.log("Login...");
    const config: CustomAxiosRequestConfig = { skipAuthRefresh: true }; // משתמשים בממשק החדש

    apiClient
      .post("/auth/login", user, config) // מוסיפים את config לבקשה
      .then((response: any) => {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("loggedUserId", response.data._id);
        localStorage.setItem("imgUrl", response.data.imgUrl);
        localStorage.setItem("userName", response.data.userName);
        console.log(response);
        resolve(response.data);
      })
      .catch((error: any) => {
        console.log(error);
        reject(error);
      });
  });
};
