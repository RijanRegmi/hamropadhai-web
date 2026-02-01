import axios from "./axios";

export const getProfile = async () => {
  try {
    const response = await axios.get("/api/auth/profile", {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch profile"
    );
  }
};

export const uploadProfileImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await axios.post("/api/auth/upload-profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to upload image"
    );
  }
};