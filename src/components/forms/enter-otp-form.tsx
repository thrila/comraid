"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "../button/button";
import { z } from "zod";
import { enterOtpSchema } from "@/lib/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastFirstError } from "@/lib/form-errors";
import { toast } from "react-toastify";
import { useResendOtpMutation, useVerifyMutation } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/base";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import Logo from "@/components/logo";

export type EnterOTPFields = z.infer<typeof enterOtpSchema>;

const DIGITS: (keyof EnterOTPFields)[] = [
  "firstInt",
  "secondInt",
  "thirdInt",
  "fourthInt",
  "fifthInt",
  "sixthInt",
];

const EnterOtpForm = () => {
  const router = useRouter();

  const email = useSelector((state: RootState) => state.auth.email);

  const [verifyUser] = useVerifyMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { isSubmitting },
  } = useForm<EnterOTPFields>({
    resolver: zodResolver(enterOtpSchema),
  });
  const onSubmit: SubmitHandler<EnterOTPFields> = async (data) => {
    const otp = `${data.firstInt}${data.secondInt}${data.thirdInt}${data.fourthInt}${data.fifthInt}${data.sixthInt}`;
    if (!email) {
      toast.error("Start by signing up or logging in");
      router.push("/sign-up");
      return;
    }
    try {
      const user = await verifyUser({ otp, email }).unwrap();
      toast.success("Your email is verified");
      router.push(user.is_seller ? "/dashboard" : "/");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not verify that code"));
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      const { message } = await resendOtp({ email }).unwrap();
      toast.info(message);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not resend the code"));
    }
  };

  return (
    <div className="bg-light flex flex-col justify-center items-center py-10 gap-5 w-full md:container md:mx-auto px-5">
      {/* website logo */}
      <Logo className="text-4xl text-black" />
      <div>
        <h3 className="font-semibold text-2xl text-center">VERIFY YOUR EMAIL</h3>
        <p className="text-ash text-center mt-2">
          {email ? (
            <>
              Enter the 6-digit code we sent to <span className="text-black">{email}</span>
            </>
          ) : (
            "Enter the 6-digit code we emailed you"
          )}
        </p>
      </div>
      {/* Form */}
      <form
        className="w-full md:px-10 flex flex-col gap-5 justify-center items-center"
        onSubmit={handleSubmit(onSubmit, toastFirstError)}
      >
        <div className="flex gap-2 md:gap-4 justify-center items-center">
          {DIGITS.map((name, i) => {
            const field = register(name);
            return (
              <input
                key={name}
                {...field}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${i + 1}`}
                maxLength={1}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(-1);
                  field.onChange(e);
                  if (e.target.value && i < DIGITS.length - 1) setFocus(DIGITS[i + 1]);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !e.currentTarget.value && i > 0) setFocus(DIGITS[i - 1]);
                }}
                onPaste={(e) => {
                  // Pasting "123456" into any box fills them all.
                  const code = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  if (code.length < 2) return;
                  e.preventDefault();
                  code.split("").forEach((digit, j) => setValue(DIGITS[j], digit, { shouldValidate: true }));
                  setFocus(DIGITS[Math.min(code.length, DIGITS.length - 1)]);
                }}
                className="border border-black bg-light text-3xl text-center w-11 h-12 md:w-14 md:h-16 focus:outline-none focus:border-red"
              />
            );
          })}
        </div>
        <div>
          <Button type="submit" size={"lg"} disabled={isSubmitting}>
            {isSubmitting ? "VERIFYING..." : "VERIFY"}
          </Button>
        </div>
        <p className="text-placeholder-ash">
          Haven&apos;t seen the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !email}
            className="text-black underline disabled:opacity-50"
          >
            Resend Code
          </button>
        </p>
      </form>
    </div>
  );
};

export default EnterOtpForm;
