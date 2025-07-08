import React from "react";
import LoginForm from "../components/LoginForm";
 // Use "../ui/LoginForm" instead of "@/ui/LoginForm" for safety

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <LoginForm />
    </div>
  );
};

export default Login;

