export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^\d{10,13}$/;

export const requiredMessage = (label) => `${label} wajib diisi.`;

export const validateRequired = (value, label) => (
  String(value || "").trim() ? "" : requiredMessage(label)
);

export const validateEmail = (value, { required = false, label = "Email" } = {}) => {
  const text = String(value || "").trim();
  if (!text) return required ? requiredMessage(label) : "";
  return emailPattern.test(text) ? "" : "Format email belum sesuai.";
};

export const validatePhone = (value, { required = false, label = "Nomor telepon" } = {}) => {
  const text = String(value || "").trim();
  if (!text) return required ? requiredMessage(label) : "";
  return phonePattern.test(text) ? "" : "Nomor telepon harus 10-13 digit angka.";
};

export const normalizeDigits = (value, maxLength = 13) => (
  String(value || "").replace(/\D/g, "").slice(0, maxLength)
);

export const validatePassword = (value, {
  required = false,
  label = "Kata sandi",
  minLength = 8,
  requireLetterAndNumber = true,
} = {}) => {
  const text = String(value || "");
  if (!text) return required ? requiredMessage(label) : "";
  if (text.length < minLength) return `${label} minimal ${minLength} karakter.`;
  if (requireLetterAndNumber && (!/[A-Za-z]/.test(text) || !/[0-9]/.test(text))) {
    return `${label} harus memuat huruf dan angka.`;
  }
  return "";
};

export const validatePasswordConfirmation = (password, confirmation, {
  required = false,
  label = "Konfirmasi kata sandi",
} = {}) => {
  const text = String(confirmation || "");
  if (!text) return required ? requiredMessage(label) : "";
  return text === String(password || "") ? "" : "Konfirmasi kata sandi tidak sesuai.";
};
