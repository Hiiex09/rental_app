import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const signup = async (formData: any) => {
    const { firstName, lastName, address, email, mobile, password, role } = formData;
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error("EMAIL_EXISTS");
    }

    const existingMobile = await prisma.user.findUnique({
        where: { mobile },
    });

    if (existingMobile) {
        throw new Error("MOBILE_EXISTS");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            firstName,
            lastName,
            address,
            email,
            mobile,
            password: hashPassword,
            role: (role?.toUpperCase() as Role) || Role.TENANT,
        },
    });
    return newUser;
};

export const login = async (formData: any) => {
    const { email, password } = formData;

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const now = new Date();

    if (user.isLocked) {
        if (user.lockUntil && user.lockUntil > now) {
            const remainingMs = user.lockUntil.getTime() - now.getTime();
            const remainingSeconds = Math.ceil(remainingMs / 1000);

            throw {
                message: "Account is locked",
                status: 403,
                remainingSeconds,
            };
        }

        if (user.lockUntil && user.lockUntil <= now) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    isLocked: false,
                    failedAttempts: 0,
                    lockUntil: null
                }
            });
        }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        const countAttempts = user.failedAttempts += 1;

        if (countAttempts >= 3) {
            const lockTime = new Date(now.getTime() + 3 * 60 * 1000);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedAttempts: countAttempts,
                    isLocked: true,
                    lockUntil: lockTime
                }
            })

            throw new Error("Account locked due to too many failed attempts.");
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedAttempts: countAttempts,
            },
        });

        throw new Error(`Invalid credentials. Attempt ${countAttempts}`);
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            failedAttempts: 0,
            isLocked: false,
            lockUntil: null,
            lastLogin: now,
        },
    });

    return {
        id: user.id,
        email: user.email,
    };
}