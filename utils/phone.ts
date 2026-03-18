export function nzPhoneFromIntl(phone?: string | null): string {
  if (!phone) return "";

  let value = phone.trim();

  // remove spaces
  value = value.replace(/\s+/g, "");

  // +64211234567 -> 0211234567
  if (value.startsWith("+64")) {
    return "0" + value.slice(3);
  }

  // 64211234567 -> 0211234567
  if (value.startsWith("64")) {
    return "0" + value.slice(2);
  }

  return value;
}