import * as z from "zod";

export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Too Short" }),
  username: z.string().min(2, { message: "Too Short" }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export const PostValidation = z.object({
  caption: z.string().min(5, { message: "Caption should be at least 5 characters." }).max(2200, { message: "Maximum 2200 characters" }),
  file: z.custom<File[]>(),
  location: z.string().min(1, {message: "This field is required"}).max(1000, { message: "Maximum 1000 characters"}),
  tags: z.string(),
});