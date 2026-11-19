"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import React from "react";
import Image from "next/image";
import Logo from "@/components/logo";
// import ArrowRight from "/public/images/icons/arrow_right.svg";
import Link from "next/link";
import { Button } from "../button/button";
import { z } from "zod";
import { forgotPasswordSchema } from "@/lib/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastFirstError } from "@/lib/form-errors";

type ForgotPasswordField = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordField>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordField> = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(data);
  };

  return (
    <div className="bg-light flex flex-col justify-center items-center py-10 gap-5 w-full md:container md:mx-auto px-5">
      {/* website logo */}
      <Logo className="text-4xl text-black" />
      <div>
        <h3 className="font-semibold text-2xl">ENTER EMAIL ADDRESS</h3>
      </div>
      {/* Form */}
      <form
        className="w-full md:px-10 flex flex-col gap-10 justify-center items-center max-w-[500px]"
        onSubmit={handleSubmit(onSubmit, toastFirstError)}
      >
        <input
          type="email"
          {...register("email", { required: true })}
          autoComplete="email"
          placeholder="Email"
          className="w-full border border-black bg-light placeholder:text-placeholder-ash py-3 px-3 "
        />
        <div className="w-full">
          <Button variant={"default"} size={"lg"} type="submit">
            {isSubmitting ? "SUBMITTING..." : "GET OTP"}
          </Button>
        </div>
        <div className="w-full flex justify-center items-center md:mt-[20px]">
          <div className="pr-5">
            <p className="text-placeholder-ash">Don&apos;t have an account?</p>
          </div>
          <div>
            <div className="flex flex-row">
              <Link href="/sign-up" className="underline text-black mr-2">
                Sign Up
              </Link>
              <span>
                {" "}
                <Image
                  src="/images/icons/arrow_right.svg"
                  alt="right arrow"
                  width={20}
                  height={10}
                />
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
