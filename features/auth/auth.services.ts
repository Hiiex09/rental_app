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