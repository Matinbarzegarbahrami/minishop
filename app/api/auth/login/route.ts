import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { generateVerifyCode, getVerificationExpiry } from "@/src/lib/otp";
import { parseJsonBody, parseLoginBody } from "@/src/lib/validators";

// POST /api/auth/login
// بررسی پسورد + صدور OTP جدید (session نهایی اینجا ساخته نمی‌شود)
export async function POST(request: NextRequest) {
  try {
    const parsedBody = await parseJsonBody(request);

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: parsedBody.message },
        { status: 400 }
      );
    }

    const parsed = parseLoginBody(parsedBody.data);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.message },
        { status: 401 }
      );
    }

    const { phone, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { phone } });

    // خطای عمومی authentication: وجود کاربر و صحت رمز لو نمی‌رود
    if (!user) {
      return NextResponse.json(
        { message: "شماره موبایل یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "شماره موبایل یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    // در این مرحله session نهایی ایجاد نمی‌شود؛ فقط OTP جدید صادر می‌شود
    const verifyCode = generateVerifyCode();
    const expireAt = getVerificationExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyCode,
        expireAt,
      },
    });

    return NextResponse.json(
      {
        message: "کد تأیید برای شما ارسال شد.",
        requiresVerification: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "خطایی رخ داد. دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}