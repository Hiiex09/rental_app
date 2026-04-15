import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma';

export async function verifyAuth() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!accessToken && !refreshToken) {
        throw new Error("Unauthorized: No token provided");
    }

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, process.env.NEXT_JWT_SECRET_ACCESS_TOKEN!) as any;
            return decoded;
        } catch (error: any) {
            if (error.name !== "TokenExpiredError" || !refreshToken) {
                throw new Error("Unauthorized: Invalid access token");
            }
        }
    }

    if (!refreshToken) {
        throw new Error("Unauthorized: No refresh token available");
    }

    try {

    } catch (error) {
        try {
            const decodedRefresh = jwt.verify(refreshToken, process.env.NEXT_JWT_SECRET_REFRESH_TOKEN!) as any;

            const userId = decodedRefresh.id || decodedRefresh.user_id;
            if (!userId) {
                throw new Error("Unauthorized: Invalid refresh token payload");
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, role: true }
            })

            if (!user) {
                throw new Error("Unauthorized: User not found");
            }

            const newAccessToken = jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
            }, process.env.NEXT_JWT_SECRET_ACCESS_TOKEN!,
                { expiresIn: "15m" })

            cookieStore.set("access_token", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 15 * 60,
                path: "/",
            })

            const newlyDecoded = jwt.verify(
                newAccessToken,
                process.env.NEXT_JWT_SECRET_ACCESS_TOKEN!
            ) as any;

            return newlyDecoded;
        } catch (error: any) {
            throw new Error(`Unauthorized: Invalid refresh token (${error.message})`);
        }
    }
}