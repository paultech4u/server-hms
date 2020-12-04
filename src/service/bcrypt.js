import { hash, compare } from "bcrypt";

export async function Encrypt(password, salt) {
  try {
    const encryptedPassword = await hash(password, salt);
    return encryptedPassword;
  } catch (error) {
    if (error) {
      return error;
    }
  }
}

export async function Compare(password, encrypt) {
  try {
    const isMatch = await compare(password, encrypt);
    return isMatch;
  } catch (error) {
    if (error) {
      return error;
    }
  }
}
