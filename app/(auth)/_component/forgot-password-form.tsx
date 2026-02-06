"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthLayout from "./AuthLayout";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (values: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: values.email }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Failed to send verification code");
        setIsLoading(false);
        return;
      }

      // Show success message
      toast.success("Verification code sent! Check your email.");

      // Redirect to verification code page (using replace to prevent back button issues)
      setTimeout(() => {
        router.replace(
          `/verification-code?email=${encodeURIComponent(values.email)}`,
        );
      }, 1000);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="FORGOT PASSWORD"
      switchText="Remember your password?"
      switchLink="/login"
      switchLabel="Sign in"
    >
      <p className="text-sm text-gray-600 mb-6">
        Enter your email address and we'll send you a verification code to reset
        your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          className="auth-input"
          placeholder="Email Address"
          type="email"
          maxLength={64}
          autoComplete="email"
          {...register("email")}
        />
        {errors.email?.message && (
          <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
        )}

        <button type="submit" className="auth-btn" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Verification Code"}
        </button>
      </form>
    </AuthLayout>
  );
}

// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import AuthLayout from "./AuthLayout";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";

// const forgotPasswordSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
// });

// type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

// export default function ForgotPasswordForm() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ForgotPasswordData>({
//     resolver: zodResolver(forgotPasswordSchema),
//     mode: "onSubmit",
//   });

//   const onSubmit = async (values: ForgotPasswordData) => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"}/api/auth/forgot-password`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ email: values.email }),
//         },
//       );

//       const result = await response.json();

//       if (!response.ok || !result.success) {
//         toast.error(result.message || "Failed to send verification code");
//         setIsLoading(false);
//         return;
//       }

//       // Show success message
//       toast.success("Verification code sent! Check your email.");

//       // Redirect to verification code page (using replace to prevent back button issues)
//       setTimeout(() => {
//         router.replace(
//           `/verification-code?email=${encodeURIComponent(values.email)}`,
//         );
//       }, 1000);
//     } catch (error: any) {
//       console.error("Forgot password error:", error);
//       toast.error("Network error. Please check your connection and try again.");
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AuthLayout
//       title="FORGOT PASSWORD"
//       switchText="Remember your password?"
//       switchLink="/login"
//       switchLabel="Sign in"
//     >
//       <p className="text-sm text-gray-600 mb-6">
//         Enter your email address and we'll send you a verification code to reset
//         your password.
//       </p>

//       <form onSubmit={handleSubmit(onSubmit)}>
//         <input
//           className="auth-input"
//           placeholder="Email Address"
//           type="email"
//           maxLength={64}
//           autoComplete="email"
//           {...register("email")}
//         />
//         {errors.email?.message && (
//           <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
//         )}

//         <button type="submit" className="auth-btn" disabled={isLoading}>
//           {isLoading ? "Sending..." : "Send Verification Code"}
//         </button>
//       </form>
//     </AuthLayout>
//   );
// }
