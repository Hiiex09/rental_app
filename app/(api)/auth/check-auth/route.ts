import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/serverAuth"
import { NextResponse } from "next/server";


export async function GET() {
    try {
        let decode: any;

        try {
            decode = await verifyAuth();
        } catch (authError: any) {
            return NextResponse.json({
                message: authError.message,
                authenticated: false,
            }, { status: 401 });
        }


        const userId = decode?.id;

        if (!userId) {
            return NextResponse.json(
                { message: "Invalid token payload", authenticated: false },
                { status: 401 }
            );
        }


        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                firstName: true,
                lastName: true,
                role: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found", authenticated: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                email: user.email,
                fullName: `${user.firstName} ${user.lastName}`,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error("Error in checkAuth:", error.message);

        return NextResponse.json(
            { message: "Internal server error", authenticated: false },
            { status: 500 }
        );
    }
}