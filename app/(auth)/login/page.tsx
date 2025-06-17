import { LoginForm } from "@/components/login-form";
import localFont from "next/font/local";

const nicoMoji = localFont({
  src: "../../../public/NicoMoji-Regular.ttf",
});

export default function LoginPage() {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="flex flex-col gap-0 p-6 md:p-10">
        <div className="flex justify-center gap-2">
          <a
            href="#"
            className={"flex items-center gap-2 " + nicoMoji.className}
          >
            <div className="flex flex-col !gap-0 text-center self-center">
              <span className="text-primary text-4xl">Arena</span>
              <span className="text-white text-2xl">Sports</span>
            </div>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/water-pool.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
