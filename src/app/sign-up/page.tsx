import SignUpForm from "@/components/forms/sign-up-form";
import React from "react";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-row ">
      <div className="md:w-1/2 lg:w-3/5 min-h-screen bg-sign-up-banner bg-cover bg-center hidden md:block"></div>
      <div className="md:w-1/2 lg:w-2/5 w-full flex min-h-screen bg-light">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;
