"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconMailFilled } from "@tabler/icons-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import localFont from "next/font/local";
import { useSession } from "@/contexts/SessionContext";
import { toast } from "sonner";
import { fetch } from "@tauri-apps/plugin-http";

const nicoMoji = localFont({
  src: "../public/NicoMoji-Regular.ttf",
});

interface LoginFormProps extends React.ComponentProps<"form"> {}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useSession();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/v1/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        const error = data;
        throw new Error(error.message || "Failed to send OTP");
      }

      setIsOtpSent(true);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) return;

    setIsLoading(true);

    const response = await fetch("http://localhost:3000/v1/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phoneNumber,
        code: otp,
        deviceId: "web-app", // You can make this dynamic
      }),
    });

    console.log("hello world");
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      const error = data;
      console.log(error.message || "Invalid OTP");
    }

    console.log(data);
    await login(data);

    toast.success("Login successful!");
    router.push("/"); // or wherever you want to redirect
    try {
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error(error instanceof Error ? error.message : "Invalid OTP");
      setOtp(""); // Clear OTP on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp("");
    setIsOtpSent(false);
    await handleSendOtp(new Event("submit") as any);
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className={"text-4xl font-bold " + nicoMoji.className}>Login</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {isOtpSent
            ? `Enter the verification code sent to ${phoneNumber}`
            : "Enter your phone number below to login to your account"}
        </p>
      </div>

      <div className="grid gap-6">
        {!isOtpSent ? (
          <div className="grid gap-3">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex flex-row gap-2">
              <Input
                id="phone"
                type="text"
                placeholder="+995 555 65 23 11"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !phoneNumber}>
                {isLoading ? "Sending..." : "Send Code"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <Label htmlFor="otp">One-Time Password</Label>
            <div className="flex justify-center content-center">
              <InputOTP
                maxLength={4}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="link"
                onClick={handleResendOtp}
                disabled={isLoading}
              >
                Resend Code
              </Button>
            </div>
          </div>
        )}

        {isOtpSent && (
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otp.length !== 4}
          >
            {isLoading ? "Verifying..." : "Login"}
          </Button>
        )}

        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>

        <Button disabled variant="outline" className="w-full">
          <IconMailFilled />
          Login with Email
        </Button>
      </div>
    </form>
  );
}
