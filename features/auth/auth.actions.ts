
import { login, signup } from "./auth.services";
import { LoginFormData, SignupFormData } from "./auth.validations";


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

export const LoginAction = async (data: LoginFormData) => {
    const user = await login(data);

    return {
        id: user.id,
        email: user.email
    }
}