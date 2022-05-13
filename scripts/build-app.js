const builder = require('electron-builder');

const isRelease = process.env.BUILD_RELEASE == 'true';
const versionType = isRelease ? 'release' : 'nightly';
const productName = isRelease ? 'Colorpicker' : 'Colorpicker Nightly';

console.log('Building', productName, 'in', versionType, 'mode.');

builder
  .build({
    config: {
      appId: isRelease ? 'fr.toinane.colorpicker' : 'fr.toinane.colorpicker.nightly',
      productName,
      copyright: 'Copyright © 2016 - 2021 Toinane',
      artifactName: '${productName}-${version}${arch}.${ext}',
      files: ['dist/**/*'],
      compression: isRelease ? 'maximum' : 'store',
      buildDependenciesFromSource: true,
      directories: {
        buildResources: 'config',
        output: 'release',
      },
      publish: false,
      // afterSign: 'scripts/notarize.js',
      mac: {
        target: ['dmg'],
        category: 'public.app-category.graphics-design',
        icon: `config/${versionType}/icon_osx_bigsur.icns`,
        entitlements: 'config/entitlements.mac.plist',
        entitlementsInherit: 'config/entitlements.mac.plist',
        darkModeSupport: true,
        type: isRelease ? 'distribution' : 'development',
        extendInfo: {
          // NSRequiresAquaSystemAppearance: false
          CFBundleName: productName,
          CFBundleDisplayName: productName,
          CFBundleExecutable: productName,
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
        background: `config/${versionType}/dmg_background.png`,
        icon: `config/${versionType}/dmg_installer.icns`,
        window: {
          width: 540,
          height: 330,
        },
        contents: [
          {
            type: 'link',
            path: '/Applications',
            x: 390,
            y: 150,
          },
          {
            type: 'file',
            x: 150,
            y: 150,
          },
        ],
      },
      win: {
        target: ['nsis'],
        icon: `config/${versionType}/icon.ico`,
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
        installerIcon: `config/${versionType}/nsis_installer_oldschool.ico`,
        uninstallerIcon: `config/${versionType}/nsis_installer_oldschool.ico`,
        installerHeader: `config/${versionType}/installer_header.bmp`,
        installerSidebar: `config/${versionType}/installer_sidebar.bmp`,
        uninstallerSidebar: `config/${versionType}/installer_sidebar.bmp`,
        artifactName: '${productName}-${version}${arch}-installer.${ext}',
      },
      linux: {
        target: ['AppImage', 'deb', 'freebsd', 'tar.gz'],
        executableName: 'colorpicker-app',
        icon: `config/${versionType}/`,
        synopsis: `${productName} App`,
        category: 'Graphics',
        mimeTypes: ['cpk', 'gpl', 'aco', 'ase', 'pal', 'afpalette', 'aseprite', 'hex', 'col', 'ai'],
        desktop: {
          Name: productName,
          Type: 'Application',
          Icon: `config/${versionType}/icon.png`,
          Categories: 'Graphics;Utility',
        },
      },
    },
  })
  .catch((err) => console.error(err));
