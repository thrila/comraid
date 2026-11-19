import LoginForm from "@/components/forms/login-form";
import React from "react";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-row ">
      <div className="md:w-1/2 lg:w-3/5 h-screen bg-login-banner bg-cover bg-center hidden md:block"></div>
      <div className="md:w-1/2 lg:w-2/5 w-full flex min-h-screen bg-light">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
