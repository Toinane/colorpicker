require('dotenv/config')
const builder = require('electron-builder')

const isRelease = process.env.BUILD_RELEASE == 'true'
const versionType = isRelease ? 'release' : 'nightly'
const productName = isRelease ? 'Colorpicker' : 'Colorpicker Nightly'

builder
    .build({
        config: {
            appId: isRelease ? 'fr.toinane.colorpicker' : 'fr.toinane.colorpicker-nightly',
            productName: productName,
            copyright: 'Copyright © 2016 - 2021 Toinane',
            artifactName: '${productName}-${version}${arch}.${ext}',
            files: ['dist/**/*'],
            compression: isRelease ? 'maximum' : 'store',
            buildDependenciesFromSource: true,
            directories: {
                buildResources: 'assets',
                output: 'release',
            },
            publish: false,
            //afterSign: 'scripts/notarize.js',
            mac: {
                target: ['dmg'],
                category: 'public.app-category.graphics-design',
                icon: `assets/${versionType}/icon.icns`,
                entitlements: 'assets/config/entitlements.mac.plist',
                entitlementsInherit: 'assets/config/entitlements.mac.plist',
                darkModeSupport: true,
                type: 'development',
                extendInfo: {
                    //NSRequiresAquaSystemAppearance: false
                    CFBundleName: 'Colorpicker',
                    CFBundleDisplayName: 'Colorpicker',
                    CFBundleExecutable: 'Colorpicker',
                    CFBundlePackageType: 'APPL',
                    CFBundleDocumentTypes: [
                        {
                            CFBundleTypeName: 'ColorpickerFile',
                            CFBundleTypeRole: 'Editor',
                            LSItemContentTypes: [
                                'public.cpk',
                                'public.gpl',
                                'public.aco',
                                'public.ase',
                                'public.pal',
                                'public.afpalette',
                                'public.aseprite',
                                'public.hex',
                                'public.col',
                                'public.ai',
                            ],
                            LSHandlerRank: 'Default',
                        },
                    ],
                },
            },
            dmg: {
                background: `assets/${versionType}/dmg_background.png`,
                icon: `assets/${versionType}/dmg_installer.icns`,
                window: {
                    width: 540,
                    height: 310,
                },
            },
            win: {
                target: ['nsis', 'msi'],
                icon: `assets/${versionType}/icon.ico`,
                publisherName: 'Crea-THAT',
                verifyUpdateCodeSignature: false,
                fileAssociations: [
                    {
                        ext: ['cpk', 'gpl', 'aco', 'ase', 'pal', 'afpalette', 'aseprite', 'hex', 'col', 'ai'],
                        description: 'Palette files',
                    },
                ],
            },
            nsis: {
                oneClick: false,
                perMachine: false,
                createDesktopShortcut: true,
                createStartMenuShortcut: true,
                allowToChangeInstallationDirectory: true,
                installerIcon: `assets/${versionType}/nsis_installer_oldschool.ico`,
                uninstallerIcon: `assets/${versionType}/nsis_installer_oldschool.ico`,
                installerHeader: `assets/${versionType}/installer_header.bmp`,
                installerSidebar: `assets/${versionType}/installer_sidebar.bmp`,
                uninstallerSidebar: `assets/${versionType}/installer_sidebar.bmp`,
                artifactName: '${productName}-${version}${arch}-installer.${ext}',
            },
            linux: {
                target: ['AppImage', 'deb', 'freebsd', 'tar.gz'],
                executableName: 'colorpicker-app',
                icon: `assets/${versionType}/`,
                synopsis: `${productName} App`,
                category: 'Graphics',
                mimeTypes: ['cpk', 'gpl', 'aco', 'ase', 'pal', 'afpalette', 'aseprite', 'hex', 'col', 'ai'],
                desktop: {
                    Name: productName,
                    Type: 'Application',
                    Icon: `assets/${versionType}/icon.png`,
                    Categories: 'Graphics;Utility',
                },
            },
        },
    })
    .catch((err) => console.error(err))
