const { notarize } = require('electron-notarize')

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context
    if (electronPlatformName !== 'darwin') return

    const appName = context.packager.appInfo.productFilename

    return await notarize({
        appBundleId: process.env.APP_BUNDLE_ID,
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PWD,
        ascProvider: process.env.ASC_PROVIDER,
    })
}
