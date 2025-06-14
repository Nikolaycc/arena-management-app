import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconMailFilled } from "@tabler/icons-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import localFont from "next/font/local";

const nicoMoji = localFont({
  src: "../public/NicoMoji-Regular.ttf",
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className={"text-4xl font-bold " + nicoMoji.className}>Login</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your phone number below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="flex flex-row gap-2">
            <Input
              id="phone"
              type="tel"
              placeholder="+955 555 65 23 11"
              required
            />
            <Button>Send Code</Button>
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">One-Time Password</Label>

          <div className="flex justify-center content-center">
            <InputOTP maxLength={4}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />

                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
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
