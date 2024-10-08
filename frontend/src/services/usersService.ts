import apiClient from "./apiClient";

export interface IUpdateUser {
  userName?: string;
  email?: string;
  password?: string;
  imgUrl?: string;
}

export const updateUser = (userId: string, user: IUpdateUser) => {
  const accessToken = localStorage.getItem("token");

  return new Promise<IUpdateUser>((resolve, reject) => {
    console.log("Update user...");
    apiClient
      .put(
        `/users/${userId}`,
        {
          imgUrl: user.imgUrl,
        },
        {
          headers: {
            Authorization: `jwt ${accessToken}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        localStorage.setItem("imgUrl", response.data.imgUrl);
        resolve(response.data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

export const deleteUser = (userId: string) => {
  return new Promise<void>(async (resolve, reject) => {
    console.log("Delete User...");

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return reject("No access token available.");
    }

    try {
      // בקשת מחיקה לשרת
      await apiClient.delete(`/users/${userId}`, {
        headers: {
          Authorization: `JWT ${accessToken}`,
        },
      });

      console.log("User deleted successfully");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("loggedUserId");
      localStorage.removeItem("imgUrl");
      localStorage.removeItem("userName");
      resolve();
    } catch (error: any) {
      // הצגת השגיאה בצורה מפורטת יותר
      console.error(
        "Error deleting user:",
        error?.response?.data || error.message || error
      );
      reject(error);
    }
  });
};
