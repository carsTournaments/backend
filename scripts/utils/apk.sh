#######################################################
# Script para generacion, firma e instalacion de APKs #
#######################################################

source $(pwd)/scripts/setenv.sh
source $(pwd)/scripts/utils/utils.sh
exec 2>$(pwd)/scripts/error.log
source ~/.env/.alias

INSTALL=${1}
PATH_UNSIGNED=${PATH_APP}/android/app/build/outputs/apk/release/app-release-unsigned.apk
PATH_SIGNED=${PATH_APP}/android/app/build/outputs/apk/release/app-release-signed.apk

checkADB() {
    if [ ${INSTALL} ]; then
        ADB_STATE=$(adb get-state)
        if [ "${ADB_STATE}" = "device" ]; then
            echo "✅  Dispositivo conectado"
        else
            echo "❌  No hay dispositivos conectados"
            exit 1
        fi
    fi
}

generateApk() {
    jdk 11 >/dev/null
    cd ${PATH_APP} && npm run generate:apk:release >/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Build finalizado"
    else
        echo "❌ Creacion de apk fallida"
        exit 1
    fi
}

zipApk() {
    zipalign 4 $PATH_UNSIGNED $PATH_SIGNED >/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Zip finalizado"
    else
        echo "❌ Zip fallido"
        exit 1
    fi
}
signApk() {
    apksigner sign --ks-pass pass:$PASS_KEYSTORE --key-pass pass:$PASS_KEYSTORE --ks $PATH_KEYSTORE $PATH_SIGNED >/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Firma finalizada"
        echo "💎 Ruta APK: $PATH_SIGNED"
    else
        echo "❌ Firma fallida"
        exit 1
    fi
}

installApk() {
    if [ ${INSTALL} ]; then
        adb install -r --no-incremental $PATH_SIGNED >/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Instalacion finalizada"
        else
            echo "❌ Instalacion fallida"
            exit 1
        fi
    fi
}

# clear
logo
echo '>>>                       [20%]\r\n'
# some task
sleep 2
echo '>>>>>>>                   [40%]\r\n'
# some task
sleep 2
echo '>>>>>>>>>>>>>>            [60%]\r\n'
# some task
sleep 2
echo '>>>>>>>>>>>>>>>>>>>>>>>   [80%]\r\n'
# some task
sleep 2
echo '>>>>>>>>>>>>>>>>>>>>>>>>>>[100%]\r\n'
echo '\n'
checkADB
echo "🔨 Generando APK"
generateApk
zipApk
signApk
installApk
