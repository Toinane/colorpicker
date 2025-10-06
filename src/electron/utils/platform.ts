export const getPlatformDetails = () => {
  const platform = process.platform
  const arch = process.arch
  const systemVersion = process.getSystemVersion()

  return { platform, arch, systemVersion }
}
