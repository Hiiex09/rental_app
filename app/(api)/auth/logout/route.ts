import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const res = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
        res.cookies.set("access_token", "", { maxAge: 0, path: "/" });
        res.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });

        return res;
    } catch (error: any) {
        console.error("Error in logout:", error.message);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}