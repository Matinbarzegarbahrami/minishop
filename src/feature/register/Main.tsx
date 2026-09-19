"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Alert, { AlertData } from "@/src/ui/alert/Alert";
import userStore from "@/store/user";

type Step = "credentials" | "otp";

type ApiResponseBody = {
  message?: unknown;
};

// پیام خطا از response بک‌اند خوانده می‌شود (نه فقط status code)
function getErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as ApiResponseBody).message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

export default function Register() {
  const [step, setStep] = useState<Step>("credentials");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [alert, setAlert] = useState<AlertData>(null);

  const router = useRouter();

  const [error, setError] = useState({
    field: "",
    text: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError({
      field: "",
      text: "",
    });
    setAlert(null);

    if (!phone) {
      setError({
        field: "phone",
        text: "شماره تلفن را وارد کنید",
      });
      return;
    }

    if (!password) {
      setError({
        field: "password",
        text: "رمز عبور را وارد کنید",
      });
      return;
    }

    if (!password2) {
      setError({
        field: "password2",
        text: "تکرار رمز عبور را وارد کنید",
      });
      return;
    }

    let finalPhone = phone;

    if (!finalPhone.startsWith("0")) {
      finalPhone = `0${finalPhone}`;
    }

    if (!/^09\d{9}$/.test(finalPhone)) {
      setError({
        field: "phone",
        text: "شماره تلفن معتبر نیست",
      });
      return;
    }

    if (password !== password2) {
      setError({
        field: "password2",
        text: "رمز عبور و تکرار آن یکسان نیست",
      });
      return;
    }

    setSubmitting(true);

    try {
      // اول ثبت‌نام؛ اگر شماره قبلاً ثبت‌نام کرده بود، ورود با همان اطلاعات انجام می‌شود
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: finalPhone,
          password,
        }),
      });

      const registerData: unknown = await registerRes.json();

      if (registerRes.ok) {
        setAlert({
          type: "success",
          message: getErrorMessage(
            registerData,
            "ثبت‌نام با موفقیت انجام شد. کد تأیید را وارد کنید."
          ),
        });
        setStep("otp");
        return;
      }

      // شماره قبلاً ثبت‌نام کرده است → ورود با همان phone و password
      if (registerRes.status === 409) {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: finalPhone,
            password,
          }),
        });

        const loginData: unknown = await loginRes.json();

        if (loginRes.ok) {
          setAlert({
            type: "info",
            message: getErrorMessage(loginData, "کد تأیید برای شما ارسال شد."),
          });
          setStep("otp");
          return;
        }

        setAlert({
          type: "error",
          message: getErrorMessage(loginData, "خطایی رخ داد. دوباره تلاش کنید."),
        });
        return;
      }

      setAlert({
        type: "error",
        message: getErrorMessage(registerData, "خطایی رخ داد. دوباره تلاش کنید."),
      });
    } catch (error) {
      console.error("Auth request failed:", error);
      setAlert({
        type: "error",
        message: "خطایی رخ داد. دوباره تلاش کنید.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError({
      field: "",
      text: "",
    });
    setAlert(null);

    let finalPhone = phone;

    if (!finalPhone.startsWith("0")) {
      finalPhone = `0${finalPhone}`;
    }

    if (!/^\d{5}$/.test(verifyCode)) {
      setError({
        field: "verifyCode",
        text: "کد تأیید ۵ رقمی را وارد کنید",
      });
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: finalPhone,
          verifyCode,
        }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, "خطایی رخ داد. دوباره تلاش کنید."),
        });
        return;
      }

      // session در HttpOnly Cookie ست شده است؛ اطلاعات کاربر در store ذخیره می‌شود
      const { initial, setUser } = userStore.getState();
      setUser({
        ...initial,
        phone: finalPhone,
      });

      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Verify request failed:", error);
      setAlert({
        type: "error",
        message: "خطایی رخ داد. دوباره تلاش کنید.",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-lvh">
      <div className="w-100 border-2 border-[#a6009e] rounded-lg p-4 shadow-[0_0_12px_0_#a6009e4d]">
        <h2 className="text-3xl text-center font-bold text-[#5d0058]">
          {step === "otp" ? "تأیید کد" : "ورود یا ثبت‌‌نام"}
        </h2>

        {alert ? (
          <div className="mt-4">
            <Alert alert={alert} onClose={() => setAlert(null)} />
          </div>
        ) : null}

        {step === "otp" ? (
          <form
            onSubmit={handleVerify}
            className="mt-5 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="verifyCode">کد تأیید</label>

              <input
                className="px-3 py-1.5 border-2 rounded-md border-[#a659a2]"
                type="text"
                id="verifyCode"
                name="verifyCode"
                inputMode="numeric"
                maxLength={5}
                dir="ltr"
                value={verifyCode}
                onChange={(e) =>
                  setVerifyCode(e.target.value.replace(/\D/g, ""))
                }
              />

              {error.field === "verifyCode" && (
                <span className="text-red-500 text-sm">
                  {error.text}
                </span>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={verifying}
                className="bg-[#a6009e] text-white w-24 h-10 text-center rounded-md mt-4 disabled:opacity-60"
              >
                {verifying ? "در حال بررسی..." : "تأیید کد"}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-5 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="phone">شماره تلفن</label>

              <input
                className="px-3 py-1.5 border-2 rounded-md border-[#a659a2]"
                type="text"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {error.field === "phone" && (
                <span className="text-red-500 text-sm">
                  {error.text}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password">رمز ورود</label>

              <div className="relative">
                <input
                  className="w-full px-3 py-1.5 border-2 rounded-md border-[#a659a2] pl-10"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error.field === "password" && (
                <span className="text-red-500 text-sm">
                  {error.text}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password2">تکرار رمزعبور</label>

              <div className="relative">
                <input
                  className="w-full px-3 py-1.5 border-2 rounded-md border-[#a659a2] pl-10"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error.field === "password2" && (
                <span className="text-red-500 text-sm">
                  {error.text}
                </span>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#a6009e] text-white w-24 h-10 text-center rounded-md mt-4 disabled:opacity-60"
              >
                {submitting ? "در حال ورود..." : "ورود"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}