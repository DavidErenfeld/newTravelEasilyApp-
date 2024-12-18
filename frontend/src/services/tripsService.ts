// import { IComment } from "../components/searchTrip/SelectedTrip";
import apiClient, { CanceledError } from "./apiClient";
import io from "socket.io-client";

// חיבור Socket.IO לשרת
const socket = io("https://evening-bayou-77034-176dc93fb1e1.herokuapp.com");

export { CanceledError };
export interface ITrips {
  _id?: string;
  userName?: string;
  owner?: any;
  imgUrl?: string;
  typeTraveler: string;
  country: string;
  typeTrip: string;
  numOfDays?: number;
  tripDescription: string[];
  numOfComments: number;
  numOfLikes: number;
  tripPhotos?: string[];

  comments: IComment[];

  likes?: Array<{
    owner: string;
    date: Date;
  }>;
}

export interface IUpdateTrips {
  _id?: string;
  owner?: string;
  typeTraveler?: string;
  country?: string;
  typeTrip?: string;
  numOfDays?: number;
  tripDescription?: string[];
}

export interface IComment {
  _id?: string;
  ownerId?: string;
  owner?: string;
  comment: string;
  date: string;
}

const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");

const getAllTrips = () => {
  const abortController = new AbortController();
  const req = apiClient.get<ITrips[]>("trips", {
    signal: abortController.signal,
  });
  console.log("getAllTrips");
  return { req, abort: () => abortController.abort() };
};

const getByOwnerId = (userId: string) => {
  return new Promise((resolve, reject) => {
    console.log("Get By Id...");
    apiClient
      .get(`/trips/owner/${userId}`, {
        headers: {
          Authorization: `jwt ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        console.log(response);
        resolve(response.data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

const getByTripId = (tripId: string) => {
  return new Promise<ITrips>((resolve, reject) => {
    console.log("Get By Id...");
    apiClient
      .get(`/trips/FullTrip/${tripId}`, {
        headers: {
          Authorization: `jwt ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        console.log(response);
        resolve(response.data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

const postTrip = (trip: ITrips) => {
  return new Promise<ITrips>((resolve, reject) => {
    console.log("Post...");
    console.log(trip);
    console.log("accessToken = " + localStorage.getItem("accessToken"));
    apiClient
      .post("/trips", trip, {
        headers: {
          Authorization: `jwt ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        console.log(response);
        resolve(response.data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

const updateTrip = (trip: IUpdateTrips) => {
  return new Promise<ITrips>((resolve, reject) => {
    console.log("Update Trip...");
    apiClient
      .put(`/trips/${trip._id}`, trip, {
        headers: {
          Authorization: `jwt ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        console.log(response);
        resolve(response.data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

const deleteTrip = (tripId: string) => {
  return new Promise<void>((resolve, reject) => {
    console.log("Delete Trip...");
    apiClient
      .delete(`/trips/${tripId}`, {
        headers: {
          Authorization: `jwt ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        console.log(response);
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

const searchTripsByParams = (params: Record<string, string | number>) => {
  return new Promise<ITrips[]>((resolve, reject) => {
    console.log("Search trips by params:", params);
    apiClient
      .get("/trips//search/parameters", {
        params,
        headers: {
          Authorization: `JWT ${localStorage.getItem("accessToken")}`, // הוספת הטוקן ל-Authorization header
        },
      })
      .then((response) => {
        console.log(response);
        resolve(response.data.data); // assuming that response.data contains the results
      })
      .catch((error) => {
        console.log("Error searching trips:", error);
        reject(error);
      });
  });
};

const logout = () => {
  return new Promise<void>((resolve, reject) => {
    console.log("log out...");
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");
    if (!localStorage.getItem("refreshToken")) {
      console.log("refreshToken = " + refreshToken);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("loggedUserId");
      console.log("localStorage removt = tripService line 196----------------");
      localStorage.removeItem("imgUrl");
      localStorage.removeItem("userName");
      reject(new Error("No refresh token available. Login required."));
      return;
    }
    apiClient
      .post(
        `/auth/logout`,
        {},
        {
          headers: {
            Authorization: `JWT ${localStorage.getItem("refreshToken")}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("loggedUserId");
        localStorage.removeItem("imgUrl");
        localStorage.removeItem("userName");
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

const addComment = (tripId: string, comment: IComment) => {
  return new Promise<IComment>((resolve, reject) => {
    console.log("Add Comment...");
    apiClient
      .post(
        `/trips/${tripId}/comments`,
        { comment },
        {
          headers: {
            Authorization: `jwt ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        socket.emit("addComment", { tripId, comment: response.data }); // שליחת אירוע סוקט
        resolve(response.data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

// פונקציה למחיקת תגובה עם סוקט
const deleteComment = (tripId: string, commentId: string) => {
  return new Promise<void>((resolve, reject) => {
    console.log("Delete Comment...");
    apiClient
      .delete(`/trips/${tripId}/${commentId}`, {
        headers: {
          Authorization: `jwt ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        console.log(response);
        socket.emit("deleteComment", { tripId, commentId }); // שליחת אירוע סוקט למחיקה
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};
const addLike = (tripId: string) => {
  return new Promise<ITrips>((resolve, reject) => {
    console.log("addLick...");
    apiClient
      .post(
        `/trips/${tripId}/likes`,
        { owner: "david" },
        {
          headers: {
            Authorization: `jwt ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        resolve(response.data);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};
export default {
  getAllTrips,
  getByOwnerId,
  getByTripId,
  postTrip,
  updateTrip,
  searchTripsByParams,
  addLike,
  deleteTrip,
  logout,
  addComment,
  deleteComment,
};
