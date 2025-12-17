export const generateOTPCode = (length: number) => {
  return Math.floor(1000 * length + Math.random() * (9000 * length)).toString();
};
