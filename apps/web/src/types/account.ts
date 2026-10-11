// طلب حذف الحساب من صفحة "حذف حسابك" (من غير Login) — W-18
export type AccountDeletionRequestBody = {
  full_name: string;
  phone: string;
  reason?: string;
};
