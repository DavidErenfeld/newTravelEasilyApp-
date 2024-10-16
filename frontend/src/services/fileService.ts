import apiClient from "./apiClient";

interface IUploadResponse {
  url: string;
}

const CLOUDINARY_CLOUD_NAME = "dstyeoecz";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// נוסיף את הפרמטרים לאופטימיזציה ב-URL של Cloudinary
const getOptimizedImageUrl = (publicId: string) => {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto,w_600,h_400,c_limit/${publicId}`;
};

export const uploadPhoto = async (photo: File) => {
  return new Promise<string>((resolve, reject) => {
    console.log("Uploading Photo..." + photo);
    const formData = new FormData();
    formData.append("file", photo); // התמונה עצמה
    formData.append("upload_preset", "sfrsket2"); // upload preset מהגדרות Cloudinary

    apiClient
      .post<IUploadResponse>(CLOUDINARY_UPLOAD_URL, formData)
      .then((res) => {
        console.log(res);
        const publicId = res.data.url.split("/").pop()?.split(".")[0]; // חילוץ ה-publicId מה-URL המוחזר
        if (publicId) {
          const optimizedUrl = getOptimizedImageUrl(publicId); // יצירת URL אופטימלי
          resolve(optimizedUrl);
        } else {
          reject("Failed to extract publicId");
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
export const deletePhotoFromCloudinary = async (src: string) => {
  try {
    const publicId = src.split("/").pop()?.split(".")[0];
    await apiClient.delete("file/delete-image", {
      data: { publicId },
    });
    console.log("Image deleted from Cloudinary successfully.");
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
  }
};
