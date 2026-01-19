"use server"

import { register } from "../api/auth";

export async function handleRegister ( formData: any) {
    try{
        const data = await register(formData);
        if(result.success) {
            return { success: true, message: "Account created successfully" };
        }
    }
    return { success: false, message: result.message || "Registration failed" }; 