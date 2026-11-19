import { z } from "zod";
const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const loginSchema = z.object({
  username: z.string().min(1, "Enter your username or email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional(),
});

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or fewer")
    .regex(/^[A-Za-z0-9_.-]+$/, "Username can only use letters, numbers, dots, dashes and underscores"),
  first_name: z.string().min(1, "Enter your first name"),
  last_name: z.string().min(1, "Enter your last name"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  reEnterPassword: z.string().optional(),
  is_seller: z.boolean(),
});

const otpDigit = z.string().regex(/^[0-9]$/, "Enter all 6 digits of the code");
export const enterOtpSchema = z.object({
  firstInt: otpDigit,
  secondInt: otpDigit,
  thirdInt: otpDigit,
  fourthInt: otpDigit,
  fifthInt: otpDigit,
  sixthInt: otpDigit,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const customerAddressSchema = z.object({
  first_name: z.string().min(1, "Enter a first name"),
  last_name: z.string().min(1, "Enter a last name"),
  phone: z.string().min(3, "Enter a phone number"),
  additional_phone: z.string().optional(),
  state: z.string().optional(),
  city: z.string().min(1, "Enter a city"),
  address: z.string().min(1, "Enter an address"),
  additional_information: z.string().optional(),
});

export const productSchema = z.object({
  main_image: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
  product_name: z.string(),
  product_price: z.string(),
  category: z.string().array(),
  subcategory: z.string(),
  size: z.string().array(),
  colors: z.string().array(),
  product_image_2: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
  product_image_3: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
  product_image_4: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
});
