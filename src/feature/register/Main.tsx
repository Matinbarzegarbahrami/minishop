"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter()

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
    setLoading(true);
    const body = {
      phone: finalPhone,
      password,
      password2
    }

    try {
      const res = await fetch("/api/auth",{
        method:"POST",
        body:JSON.stringify(body)
      })
      if (!res.ok){
        setError({
        field: "All",
        text: "مشکلی پیش آمده.",
      });
        return 
      }
      const data = await res.json();
      router.push("/")


    } catch (error) {

    } finally{
      setLoading(false)
    }
  };

  if (loading){
    return <div>Loading ...</div>
  }

  return (
    <div className="flex justify-center items-center min-h-lvh">
      <div className="w-100 border-2 border-[#a6009e] rounded-lg p-4 shadow-[0_0_12px_0_#a6009e4d]">
        <h2 className="text-3xl text-center font-bold text-[#5d0058]">
          ورود یا ثبت‌‌نام
        </h2>

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
            {error.field === "All" ?
            <span>{error.text}</span>
            : null}
            <button
              type="submit"
              className="bg-[#a6009e] text-white w-24 h-10 text-center rounded-md mt-4"
            >
              ورود
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

