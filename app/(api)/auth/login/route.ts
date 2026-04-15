import { LoginAction } from "@/features/auth/auth.actions";
import { loginSchema } from "@/features/auth/auth.validations";
import { generateToken } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    message: "Validation error",
                    errors: result.error.flatten(),
                },
                { status: 400 }
            );
        }

        const user = await LoginAction(result.data);
        const { access_token, refresh_token } = generateToken(user.id);

        const res = NextResponse.json(
            {
                message: "Logged successfully",
                user,
            },
            { status: 201 }
        );

        res.cookies.set("access_token", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 15 * 60,
        });

        res.cookies.set("refresh_token", refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });

        return res;

    } catch (error: any) {
        console.error(error);

        let parsed;

        try {
            parsed = JSON.parse(error.message);
        } catch {
            parsed = { message: error.message };
        }

        return NextResponse.json(
            {
                message: error.message || "Internal server error",
                remainingSeconds: error.remainingSeconds || null,
            },
            { status: error.status || 500 }
        );
    }
}