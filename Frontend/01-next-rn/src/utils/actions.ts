'use server'

import { auth, signIn } from "@/auth";
import { revalidateTag } from 'next/cache'
import { sendRequest } from "./api";


export async function authenticate(username: string, password: string) {
    try {
        const result = await signIn("credentials", {
            username: username,
            password: password,
            redirect: false,
        });

        if (!result?.ok) {
            if (result?.error === "InvalidEmailPasswordError") {
                return {
                    error: "Email hoặc mật khẩu không đúng",
                    code: 1
                };
            } else if (result?.error === "InactiveAccountError") {
                return {
                    error: "Tài khoản chưa được kích hoạt",
                    code: 2
                };
            }
            return {
                error: result?.error || "Lỗi đăng nhập",
                code: 0
            };
        }

        return result;
    } catch (error: any) {
        console.error('Authentication error:', error);
        return {
            error: "Không thể kết nối đến server",
            code: 0
        };
    }
}

export const handleCreateUserAction = async (data: any) => {
    const session = await auth();
    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: "POST",
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: { ...data }
    })
    revalidateTag("list-users")
    return res;
}

export const handleUpdateUserAction = async (data: any) => {
    const session = await auth();
    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: { ...data }
    })
    revalidateTag("list-users")
    return res;
}

export const handleDeleteUserAction = async (id: any) => {
    const session = await auth();
    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${id}`,
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
    })

    revalidateTag("list-users")
    return res;
}
