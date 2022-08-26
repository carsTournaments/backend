################################################
# Script para generacion de aab firmado #
################################################

source $(pwd)/scripts/setenv.sh
source $(pwd)/scripts/utils/utils.sh
source ~/.env/.alias

generateAab() {
    jdk 11 > /dev/null 2>&1
    cd ${PATH_APP} && npm run generate:aab > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Build finalizado"
    else
        echo "❌  Creacion de aab fallida"
        exit 1
    fi
}

generateKeystoreBase64() {
    cd ${PATH_APP} && echo ${RELEASE_KEYSTORE} > android/release.keystore.base64
    cd ${PATH_APP} && base64 -d android/release.keystore.base64 > android/release.decrypted.keystore
    if [ $? -eq 0 ]; then
        echo "✅  Generacion de keystore finalizada"
    else
        echo "❌  Generacion de keystore fallida"
        exit 1
    fi
}

sign() {
    cd ${PATH_APP} && jarsigner -keystore android/release.decrypted.keystore -storepass ${PASS_KEYSTORE} -signedjar ./android/app/build/outputs/bundle/release/app-release-signed.aab ./android/app/build/outputs/bundle/release/app-release.aab carsTournaments > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Firma finalizada"
        echo "💎  Ruta APK: ${PATH_APP}/android/app/build/outputs/bundle/release/app-release-signed.aab"
    else
        echo "❌ Firma fallida"
        exit 1
    fi
}

clear
logo
echo "🔨  Generando aab"
generateAab
generateKeystoreBase64
sign

