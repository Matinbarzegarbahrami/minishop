import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { buildSessionCookie, createSessionToken } from "@/src/lib/session";
import { parseJsonBody, parseVerifyBody } from "@/src/lib/validators";

// POST /api/auth/verify
// تأیید OTP و ساخت session نهایی داخل HttpOnly Cookie
export async function POST(request: NextRequest) {
  try {
    const parsedBody = await parseJsonBody(request);

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: parsedBody.message },
        { status: 400 }
      );
    }

    const parsed = parseVerifyBody(parsedBody.data);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.message },
        { status: 400 }
      );
    }

    const { phone, verifyCode } = parsed.data;

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || user.verifyCode !== verifyCode) {
      return NextResponse.json(
        { message: "کد تأیید وارد شده صحیح نیست." },
        { status: 400 }
      );
    }

    // کد درست است اما منقضی شده
    if (!user.expireAt || user.expireAt <= new Date()) {
      return NextResponse.json(
        { message: "کد تأیید منقضی شده است." },
        { status: 400 }
      );
    }

    // OTP مصرف می‌شود
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyCode: null,
        expireAt: null,
      },
    });

    const token = createSessionToken(user.id);

    const response = NextResponse.json(
      {
        message: "ورود با موفقیت انجام شد.",
        user: {
          id: user.id,
          phone: user.phone,
        },
      },
      { status: 200 }
    );

    response.cookies.set(buildSessionCookie(token));

    return response;
  } catch (error) {
    console.error("Verify error:", error);

    return NextResponse.json(
      { message: "خطایی رخ داد. دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}