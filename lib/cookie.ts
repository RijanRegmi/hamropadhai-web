"use server"

import { cookies } from "next/headers"

interface UserData {
    _id: string;
    email: string;
    username: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

export const setAuthToken = async (token: string, rememberMe: boolean = false) => {
    const cookieStore = await cookies();
    
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    
    cookieStore.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAge,
        path: '/',
    })
}

export const getAuthToken = async () => {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
}

export const setUserData = async (userData: UserData, rememberMe: boolean = false) => {
    const cookieStore = await cookies();
    
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    
    cookieStore.set({
        name: 'user_data',
        value: JSON.stringify(userData),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAge,
        path: '/',
    })
}

export const getUserData = async (): Promise<UserData | null> => {
    const cookieStore = await cookies();
    const userData = cookieStore.get('user_data')?.value || null;
    return userData ? JSON.parse(userData) : null;
}

export const getCurrentUserId = async (): Promise<string | null> => {
    const userData = await getUserData();
    return userData?._id || null;
}

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('user_data');
}