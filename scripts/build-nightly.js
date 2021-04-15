const builder = require('electron-builder')

builder
    .build({
        config: {
            appId: 'fr.toinane.colorpicker-nightly',
            productName: 'Colorpicker Nightly',
            copyright: 'Copyright © 2016 - 2020 Toinane',
            artifactName: '${productName}-${version}-nightly-${platform}.${ext}',
            files: ['dist/**/*'],
            compression: 'store',
            buildDependenciesFromSource: true,
            directories: {
                buildResources: 'assets',
                output: 'release',
            },
            mac: {
                category: 'public.app-category.graphics-design',
                target: ['dmg'],
                type: 'development',
                icon: 'assets/nightly/icon.icns',
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
                    //NSRequiresAquaSystemAppearance: false
                },
            },
            dmg: {
                icon: 'assets/nightly/dmg-installer.icns',
                background: 'assets/nightly/dmg-background.png',
                window: {
                    width: 540,
                    height: 380,
                },
            },
            linux: {
                icon: 'assets/nightly/',
                synopsis: 'Colorpicker Nightly App',
                category: 'Graphics',
                executableName: 'colorpicker-app',
                desktop: {
                    Name: 'Colorpicker Nightly',
                    Type: 'Application',
                    Icon: 'assets/nightly/icon.png',
                    Categories: 'Graphics;Utility',
                },
                mimeTypes: ['cpk', 'gpl', 'aco', 'ase', 'pal', 'afpalette', 'aseprite', 'hex', 'col', 'ai'],
            },
            win: {
                icon: 'assets/nightly/icon.ico',
                target: ['nsis', 'msi'],
                publisherName: 'Toinane',
                fileAssociations: [
                    {
                        ext: ['cpk', 'gpl', 'aco', 'ase', 'pal', 'afpalette', 'aseprite', 'hex', 'col', 'ai'],
                        description: 'Palette files',
                    },
                ],
                certificateFile: '.win_certificate.p12',
                certificatePassword: process.env.WIN_CERTIFICATE_PWD,
                verifyUpdateCodeSignature: false,
            },
            nsis: {
                oneClick: false,
                perMachine: false,
                createDesktopShortcut: true,
                createStartMenuShortcut: true,
                allowToChangeInstallationDirectory: true,
                installerIcon: 'assets/nightly/nsis-installer-oldschool.ico',
                artifactName: '${productName}-${version}-${platform}-installer.${ext}',
                installerHeader: 'assets/nightly/installerHeader.bmp',
                installerSidebar: 'assets/nightly/installerSidebar.bmp',
            },
        },
    })
    .catch((err) => console.error(err))
