import z from "zod";

export const signupSchema = z.object({
    firstName: z.string().nonempty("First name is required"),
    lastName: z.string().nonempty("Last name is required"),
    address: z.string().nonempty("Address is required"),
    email: z.string().email("Invalid email"),
    mobile: z.string().min(11, "Mobile number is too short").max(11, "Mobile number is too long"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["TENANT", "LANDLORD", "ADMIN"]).optional().default("TENANT"),
    profile: z.string().optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;