"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";

const formFieldSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string(),
    // .min(8, { message: "Password must be at least 6 characters long." }),
  captchaAnswer: z
    .preprocess((val) => Number(val), z.number().int().positive())
    .refine((val) => !isNaN(val), {
      message: "Captcha answer must be a number.",
    }),
  captchaNum1: z.number(),
  captchaNum2: z.number(),
});

type FormFields = z.infer<typeof formFieldSchema>;

const LoginForm = () => {
  const [captchaNum1, setCaptchaNum1] = useState<number>(0);
  const [captchaNum2, setCaptchaNum2] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [captchaValid, setCaptchaValid] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    resetField,
    clearErrors,
  } = useForm<FormFields>({
    resolver: zodResolver(formFieldSchema),
    mode: "onTouched",
  });

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaNum1(num1);
    setCaptchaNum2(num2);
    setValue("captchaNum1", num1);
    setValue("captchaNum2", num2);
    resetField("captchaAnswer");
    setCaptchaValid(null);
    clearErrors("captchaAnswer");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const credentialLogin: SubmitHandler<FormFields> = async (data) => {
    try {
      const { email, password, captchaAnswer, captchaNum1, captchaNum2 } = data;

      const expectedAnswer = captchaNum1 + captchaNum2;

      if (captchaAnswer !== expectedAnswer) {
        setError("captchaAnswer", {
          type: "manual",
          message: "Incorrect captcha answer.",
        });
        setCaptchaValid(false);
        generateCaptcha();
        return;
      } else {
        setCaptchaValid(true);
      }

      const response = await signIn("credentials", {
        email,
        password,
        captchaAnswer,
        captchaNum1,
        captchaNum2,
        redirect: false,
      });

      if (response?.error) {
        setError("root", {
          message: response.error || "Invalid credentials",
        });
        setCaptchaValid(null);
        generateCaptcha();
        resetField("captchaAnswer");
      } else {
        window.location.reload();
        // TODO Handle successful login diri
      }
    } catch (err) {
      console.error(err);
      setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
      setCaptchaValid(null);
      generateCaptcha();
      resetField("captchaAnswer");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(credentialLogin)} noValidate>
            <div className="mb-4">
              <Label htmlFor="email" className="block mb-1 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`w-full p-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-4 relative">
              <Label htmlFor="password" className="block mb-1 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full p-2 pr-10 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="mt-3" size={20} />
                ) : (
                  <Eye className="mt-3" size={20} />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <Label className="block mb-2 font-medium">Captcha</Label>
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded">
                  <span className="text-lg font-semibold">{captchaNum1}</span>
                </div>
                <span className="text-lg font-semibold">+</span>
                <div className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded">
                  <span className="text-lg font-semibold">{captchaNum2}</span>
                </div>
                <span className="text-lg font-semibold">=</span>
                <Input
                  type="number"
                  placeholder="?"
                  {...register("captchaAnswer", {
                    required: "Captcha answer is required.",
                    valueAsNumber: true,
                  })}
                  className={`w-16 p-2 border ${
                    captchaValid === true
                      ? "border-green-500"
                      : errors.captchaAnswer
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.captchaAnswer && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.captchaAnswer.message}
                </p>
              )}
              {captchaValid === true && (
                <p className="mt-1 text-sm text-green-600">
                  Captcha verified successfully!
                </p>
              )}
            </div>

            <input
              type="hidden"
              {...register("captchaNum1")}
              value={captchaNum1}
            />
            <input
              type="hidden"
              {...register("captchaNum2")}
              value={captchaNum2}
            />

            {errors.root && (
              <Alert className="mb-4">
                <AlertTitle>Error</AlertTitle>
                {errors.root.message}
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
