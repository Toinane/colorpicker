export const isValidHex = (hex: string): boolean => {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)
}
