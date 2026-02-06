'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AUTH_COOKIE_NAME = 'dl-network-auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function login(formData: FormData) {
    const password = formData.get('password') as string;
    const envPassword = process.env.ADMIN_PASSWORD;

    if (!envPassword) {
        return { error: 'Пароль администратора не настроен' };
    }

    if (password !== envPassword) {
        return { error: 'Неверный пароль' };
    }

    // Set auth cookie with simple hash
    const authToken = Buffer.from(`authenticated:${Date.now()}`).toString('base64');

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    });

    redirect('/projects');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    redirect('/login');
}

export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
    return !!authCookie?.value;
}
