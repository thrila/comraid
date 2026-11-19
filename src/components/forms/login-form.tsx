"use client";
import { useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import { Button } from "../button/button";
import { z } from "zod";
import { loginSchema } from "@/lib/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastFirstError } from "@/lib/form-errors";
import { ArrowRightIcon, FacebookIcon, XIcon } from "../svgs";
import { toast } from "react-toastify";
import { useLoginMutation } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/base";
import Logo from "@/components/logo";
import { useAppDispatch } from "@/lib/hooks";
import { signUp } from "@/lib/slice/authSlice";

export type LoginFormFields = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [loginUser] = useLoginMutation();

  const router = useRouter();
  const dispatch = useAppDispatch();
  const schema = useMemo(() => loginSchema, []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<LoginFormFields> = async (data) => {
    const { username, password, remember } = data;
    try {
      const user = await loginUser({ username, password, remember }).unwrap();
      toast.success(`Welcome back, ${user.first_name}`);
      router.push(user.is_seller ? "/dashboard" : "/");
    } catch (error) {
      const status = (error as { status?: number })?.status;
      const email = (error as { data?: { email?: string } })?.data?.email;
      toast.error(apiErrorMessage(error, "Could not log in. Please try again."));
      // Signed up but never verified: send them back to the code screen.
      if (status === 403 && email) {
        dispatch(signUp({ username, email, first_name: "", last_name: "", is_seller: false }));
        router.push("/enter-otp");
      }
    }
  };

  return (
    <div className="bg-light flex flex-col justify-center items-center py-10 gap-5 w-full md:container md:mx-auto px-5">
      {/* website logo */}
      <Link href="/" aria-label="Home">
        <Logo className="text-4xl text-black" />
      </Link>
      <div>
        <h3 className="font-semibold text-2xl">LOGIN TO CONTINUE</h3>
      </div>
      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit, toastFirstError)}
        className="w-full md:px-10 flex flex-col gap-5 justify-center items-center"
      >
        <input
          type="text"
          autoComplete="username"
          placeholder="Username or email"
          {...register("username", { required: true, minLength: 1 })}
          className={`w-full border bg-light placeholder:text-placeholder-ash py-3 px-3 ${!errors.username ? "border-black" : "border-red focus:outline-red"}`}
        />
        <input
          {...register("password", { required: true, minLength: 8 })}
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          className={`w-full border bg-light placeholder:text-placeholder-ash py-3 px-3 ${!errors.password ? "border-black" : "border-red focus:outline-red"}`}
        />
        <div className="flex flex-row justify-between w-full">
          <div className="">
            <input
              id="remember"
              className="border border-black h-4 w-4 mr-3 accent-red"
              type="checkbox"
              {...register("remember", { required: false })}
            />
            <label htmlFor="remember" className="text-placeholder-ash text-sm">
              Remember me
            </label>
          </div>
          <div>
            <Link href="/forgot-password" className="text-sm font-thin text-placeholder-ash">
              Forgot password
            </Link>
          </div>
        </div>

        <div className="w-full">
          <Button className="w-full" type="submit" size={"lg"} disabled={isSubmitting}>
            {isSubmitting ? "SUBMITTING..." : "LOGIN"}
          </Button>
        </div>
        <div className="flex flex-col justify-center">
          <p>or login with</p>
          <div className="flex flex-row justify-between">
            <div className="w-[35px] h-[35px] bg-light-grey rounded-full flex justify-center items-center">
              <div className="bg-light-grey w-[20px] h-[20px] flex items-center justify-center relative cursor-pointer">
                <XIcon />
              </div>
            </div>
            <div className="w-[35px] h-[35px] bg-light-grey rounded-full relative flex justify-center items-center">
              <div className="bg-light-grey w-[20px] h-[20px] flex items-center justify-center relative cursor-pointer ">
                <FacebookIcon />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center items-center md:mt-[20px]">
          <div className="pr-5">
            <p className="text-placeholder-ash">Don&apos;t have an account?</p>
          </div>
          <div>
            <div className="flex flex-row">
              <Link href="/sign-up" className="cursor-pointer underline text-black mr-1">
                Sign Up
              </Link>
              <span>
                <ArrowRightIcon />
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
