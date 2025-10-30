import CryptoJS from "crypto-js";
import { CRYPTO_SECRET } from "../config";

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), CRYPTO_SECRET).toString();
};

export const decryptData = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, CRYPTO_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
};