import bcrypt from "bcryptjs";

export const generateOTPCode = async (length: number) => {
  const otp = Math.floor(
    1000 * length + Math.random() * (9000 * length)
  ).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  return {
    otp,
    hashedOtp,
  };
};
