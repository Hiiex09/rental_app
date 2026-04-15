import { signup } from "./auth.services";
import { SignupFormData } from "./auth.validations";


export const SignUpAction = async (data: SignupFormData) => {
    const newUser = await signup(data);

    return {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
    };
};