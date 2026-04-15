import { NextRequest, NextResponse } from "next/server";
import { signupSchema } from "@/features/auth/auth.validations";
import { SignUpAction } from "@/features/auth/auth.actions";
import { generateToken } from "@/lib/utils";


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = signupSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    message: "Validation error",
                    errors: result.error.flatten(),
                },
                { status: 400 }
            );
        }

        const newUser = await SignUpAction(result.data);
        const { access_token, refresh_token } = generateToken(newUser.id);

        const res = NextResponse.json(
            {
                message: "User created successfully",
                newUser,
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
        if (error.message === "EMAIL_EXISTS") {
            return NextResponse.json(
                { message: "Email already exists" },
                { status: 409 }
            );
        }

        if (error.message === "MOBILE_EXISTS") {
            return NextResponse.json(
                { message: "Mobile already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}