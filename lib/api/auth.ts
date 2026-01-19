// AUTHENTICATION API CALLS

import axios from "./axios";
import { API } from "./endpoints";

export const register = async (registrastionData: any) => {
    try {
        const response = await axios.post(API.AUTH.REGISTER, registrastionData);
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message || "Registration failed"
        )
    }
}