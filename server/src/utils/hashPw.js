import bcrypt from "bcryptjs";

export const hashPassword = (plain) => bcrypt.hash(String(plain), 10);
export const comparePassword = (plain, hash) => bcrypt.compare(String(plain || ""), hash || "");
