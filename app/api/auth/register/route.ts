import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { generateVerifyCode, getVerificationExpiry } from "@/src/lib/otp";
import { parseJsonBody, parseRegisterBody } from "@/src/lib/validators";

// POST /api/auth/register
// ثبت‌نام کاربر جدید + صدور OTP (بدون برگرداندن هیچ اطلاعات حساسی)
export async function POST(request: NextRequest) {
  try {
    const parsedBody = await parseJsonBody(request);

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: parsedBody.message },
        { status: 400 }
      );
    }

    const parsed = parseRegisterBody(parsedBody.data);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.message },
        { status: 400 }
      );
    }

    const { phone, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "این شماره موبایل قبلاً ثبت‌نام کرده است." },
        { status: 409 }
      );
    }

    // password هرگز خام ذخیره نمی‌شود
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = generateVerifyCode();
    const expireAt = getVerificationExpiry();

    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        verifyCode,
        expireAt,
      },
    });

    return NextResponse.json(
      {
        message: "ثبت‌نام با موفقیت انجام شد. کد تأیید را وارد کنید.",
        requiresVerification: true,
        user: {
          id: user.id,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      { message: "خطایی رخ داد. دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}