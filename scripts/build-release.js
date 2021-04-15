require('dotenv/config')
const builder = require('electron-builder')

builder
    .build({
        config: {
            appId: 'fr.toinane.colorpicker',
            productName: 'Colorpicker',
            copyright: 'Copyright © 2016 - 2020 Toinane',
            artifactName: '${productName}-${version}-${platform}.${ext}',
            files: ['dist/**/*'],
            compression: 'maximum',
            buildDependenciesFromSource: true,
            directories: {
                buildResources: 'assets',
                output: 'release',
            },
            mac: {
                category: 'public.app-category.graphics-design',
                target: ['dmg'],
                icon: 'assets/release/icon.icns',
                extendInfo: {
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
                    darkModeSupport: true,
                    //NSRequiresAquaSystemAppearance: false,
                    entitlements: 'config/entitlements.plist',
                    entitlementsInherit: 'config/entitlements.plist',
                },
            },
            dmg: {
                icon: 'assets/release/dmg-installer.icns',
                background: 'assets/release/dmg-background.png',
                window: {
                    width: 540,
                    height: 380,
                },
                // update window size & design: https://www.electron.build/configuration/dmg
            },
            //afterSign: 'scripts/notarize.js',
            linux: {
                icon: 'assets/release/',
                synopsis: 'Colorpicker App',
                category: 'Graphics',
                executableName: 'colorpicker-app',
                desktop: {
                    Name: 'Colorpicker',
                    Type: 'Application',
                    Icon: 'assets/release/icon.png',
                    Categories: 'Graphics;Utility',
                },
                mimeTypes: ['cpk', 'gpl', 'aco', 'ase', 'pal', 'afpalette', 'aseprite', 'hex', 'col', 'ai'],
            },
            win: {
                icon: 'assets/release/icon.ico',
                target: ['nsis', 'msi'],
                publisherName: 'Toinane',
                fileAssociations: [
                    {
                        ext: ['cpk', 'gpl', 'aco', 'ase', 'pal', 'afpalette', 'aseprite', 'hex', 'col', 'ai'],
                        description: 'Palette files',
                    },
                ],
                certificateFile: 'win_certificate.p12',
                certificatePassword: process.env.WIN_CERTIFICATE_PWD,
                verifyUpdateCodeSignature: false,
            },
            nsis: {
                oneClick: false,
                perMachine: false,
                createDesktopShortcut: true,
                createStartMenuShortcut: true,
                allowToChangeInstallationDirectory: true,
                installerIcon: 'assets/release/nsis-installer-oldschool.ico',
                artifactName: '${productName}-${version}-${platform}-installer.${ext}',
                installerHeader: 'assets/release/installerHeader.bmp',
                installerSidebar: 'assets/release/installerSidebar.bmp',
            },
        },
    })
    .catch((err) => console.error(err))
