// تولید کد تأیید ۵ رقمی و زمان انقضای آن (۲ دقیقه)

export const VERIFY_CODE_TTL_MS = 2 * 60 * 1000;

export function generateVerifyCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export function getVerificationExpiry(now: number = Date.now()): Date {
  return new Date(now + VERIFY_CODE_TTL_MS);
}