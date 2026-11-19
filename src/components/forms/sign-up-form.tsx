"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../button/button";
import { z } from "zod";
import { signUpSchema } from "@/lib/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastFirstError } from "@/lib/form-errors";
import { signUp } from "../../lib/slice/authSlice";
import { useDispatch } from "react-redux";
import {
  ArrowRightIcon,
  FacebookIcon,
  ShowIcon,
  ShowOffIcon,
  XIcon,
} from "../svgs";
import { toast } from "react-toastify";
import { useRegisterMutation } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/base";
import Logo from "@/components/logo";

type SignUpFields = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [registerUser] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpFields>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<SignUpFields> = async (form) => {
    const { last_name, first_name, email, password, is_seller, username } = form;
    if (form.password !== form.reEnterPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const result = await registerUser({
        last_name,
        first_name,
        email,
        password,
        is_seller,
        username,
      }).unwrap();
      dispatch(signUp({ username, last_name, first_name, email: result.email, is_seller }));
      toast.success(result.message);
      router.push("/enter-otp");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create your account"));
    }
  };

  return (
    <div className="bg-light flex flex-col justify-center items-center py-10 gap-5 w-full md:container md:mx-auto px-5">
      {/* website logo */}
      <Link href="/" aria-label="Home">
        <Logo className="text-4xl text-black" />
      </Link>
      <div>
        <h3 className="font-semibold text-2xl">CREATE AN ACCOUNT</h3>
      </div>
      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit, toastFirstError)}
        className="w-full md:px-10 flex flex-col gap-3 justify-center items-center"
      >
        <div className="w-full">
          <input
            type="text"
            {...register("username", { required: true })}
            autoComplete="username"
            placeholder="Username"
            className="w-full border border-black bg-light placeholder:text-placeholder-ash py-3 px-3 focus:outline-none"
          />
        </div>
        <div className="w-full">
          <input
            type="text"
            {...register("first_name", { required: true })}
            autoComplete="given-name"
            placeholder="First Name"
            className="w-full border border-black bg-light placeholder:text-placeholder-ash py-3 px-3 focus:outline-none"
          />
        </div>
        <div className="w-full">
          <input
            type="text"
            {...register("last_name", { required: true })}
            autoComplete="family-name"
            placeholder="Last Name"
            className="w-full border border-black bg-light placeholder:text-placeholder-ash py-3 px-3 focus:outline-none"
          />
        </div>
        <div className="w-full">
          <input
            type="email"
            {...register("email", { required: true })}
            autoComplete="email"
            placeholder="Email"
            className="w-full border border-black bg-light placeholder:text-placeholder-ash py-3 px-3 focus:outline-none"
          />
        </div>
        <div className="w-full border border-black flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password", { required: true, minLength: 8 })}
            autoComplete="new-password"
            placeholder="Password"
            className="w-full bg-light placeholder:text-placeholder-ash py-3 px-3 outline-none"
          />
          <span className="px-3 text-xl text-black cursor-pointer" onClick={handleShowPassword}>
            {showPassword ? <ShowOffIcon /> : <ShowIcon />}
          </span>
        </div>
        <div className="w-full border border-black flex items-center">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("reEnterPassword", { required: true, minLength: 8 })}
            autoComplete="new-password"
            placeholder="Re-enter Password"
            className="w-full bg-light placeholder:text-placeholder-ash py-3 px-3 focus:outline-none"
          />
          <span
            className="px-3 text-xl text-black cursor-pointer"
            onClick={handleShowConfirmPassword}
          >
            {showConfirmPassword ? <ShowOffIcon /> : <ShowIcon />}
          </span>
        </div>
        <div className="flex flex-row justify-between w-full items-center">
          <div className=" flex items-center">
            <input
              id="is_seller"
              className="border border-black h-4 w-4 mr-3 accent-red"
              type="checkbox"
              {...register("is_seller")}
            />
            <label htmlFor="is_seller" className="text-placeholder-ash text-sm">
              I want to sell on Shop
            </label>
          </div>
          <div>
            <Link href="/forgot-password" className="text-sm text-placeholder-ash">
              Forgot password
            </Link>
          </div>
        </div>

        <div className="w-full">
          <Button type="submit" size={"lg"} disabled={isSubmitting}>
            {isSubmitting ? "SUBMITTING..." : "SIGN UP"}
          </Button>
        </div>
        <div className="flex flex-col justify-center">
          <p>or register with</p>
          <div className="flex flex-row justify-between">
            <div className="w-[35px] h-[35px] bg-light-grey rounded-full flex justify-center items-center">
              <div className="cursor-pointer bg-light-grey w-[20px] h-[20px] flex items-center justify-center relative ">
                <XIcon />
              </div>
            </div>
            <div className="w-[35px] h-[35px] bg-light-grey rounded-full relative flex justify-center items-center">
              <div className="cursor-pointer bg-light-grey w-[20px] h-[20px] flex items-center justify-center relative ">
                <FacebookIcon />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center items-center">
          <div className="pr-5">
            <p className="text-placeholder-ash ">Have an account?</p>
          </div>
          <div>
            <div className="flex flex-row">
              <Link href="/login" className="underline text-black mr-2">
                Login
              </Link>
              <span>
                {" "}
                <ArrowRightIcon />
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
