import { NextRequest } from "next/server";

export type ParsedBody<T> =
  | { success: true; data: T }
  | { success: false; message: string };

// خواندن امن body از نوع JSON
export async function parseJsonBody(
  request: NextRequest
): Promise<ParsedBody<Record<string, unknown>>> {
  try {
    const body: unknown = await request.json();

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return { success: false, message: "درخواست نامعتبر است." };
    }

    return { success: true, data: body as Record<string, unknown> };
  } catch {
    return { success: false, message: "درخواست نامعتبر است." };
  }
}

export function getStringField(
  body: Record<string, unknown>,
  field: string
): string {
  const value = body[field];
  return typeof value === "string" ? value : "";
}

// اگر صفر ابتدای شماره نبود، اضافه می‌شود
export function normalizePhone(rawPhone: string): string {
  const phone = rawPhone.trim();

  if (/^9\d{9}$/.test(phone)) {
    return `0${phone}`;
  }

  return phone;
}

export function isValidPhone(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

export type Credentials = {
  phone: string;
  password: string;
};

// اعتبارسنجی کامل برای ثبت‌نام
export function parseRegisterBody(
  body: Record<string, unknown>
): ParsedBody<Credentials> {
  const phone = normalizePhone(getStringField(body, "phone"));
  const password = getStringField(body, "password");

  if (!isValidPhone(phone)) {
    return { success: false, message: "شماره تلفن معتبر نیست." };
  }

  if (!password) {
    return { success: false, message: "رمز عبور را وارد کنید." };
  }

  if (password.length < 6) {
    return { success: false, message: "رمز عبور باید حداقل ۶ کاراکتر باشد." };
  }

  // bcrypt حداکثر ۷۲ بایت از رمز عبور را در نظر می‌گیرد
  if (password.length > 72) {
    return {
      success: false,
      message: "رمز عبور نمی‌تواند بیشتر از ۷۲ کاراکتر باشد.",
    };
  }

  return { success: true, data: { phone, password } };
}

// برای ورود فقط presence بررسی می‌شود تا همیشه خطای عمومی برگردد
export function parseLoginBody(
  body: Record<string, unknown>
): ParsedBody<Credentials> {
  const phone = normalizePhone(getStringField(body, "phone"));
  const password = getStringField(body, "password");

  if (!isValidPhone(phone) || !password) {
    return { success: false, message: "شماره موبایل یا رمز عبور اشتباه است." };
  }

  return { success: true, data: { phone, password } };
}

export type VerifyPayload = {
  phone: string;
  verifyCode: string;
};

// اعتبارسنجی body مربوط به تأیید کد
export function parseVerifyBody(
  body: Record<string, unknown>
): ParsedBody<VerifyPayload> {
  const phone = normalizePhone(getStringField(body, "phone"));
  const verifyCode = getStringField(body, "verifyCode").trim();

  if (!isValidPhone(phone)) {
    return { success: false, message: "شماره تلفن معتبر نیست." };
  }

  if (!/^\d{5}$/.test(verifyCode)) {
    return { success: false, message: "کد تأیید وارد شده صحیح نیست." };
  }

  return { success: true, data: { phone, verifyCode } };
}