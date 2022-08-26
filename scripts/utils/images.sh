source $(pwd)/scripts/setenv.sh
source $(pwd)/scripts/utils/utils.sh
exec 2>$(pwd)/scripts/error.log

TYPE=${1} # proToLocal or localToPro

proToLocal() {
    echo "🔨  Exportando imagenes al servidor local"
    rsync -avzhe "ssh" ${SSH_HOST}:${PATH_APPS_PRO}/uploads/carsTournaments/ $PATH_UPLOADS/ > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Sincronizacion de imagenes Servidor-Localhost completada"
    else
        echo "❌  Sincronizacion de imagenes Servidor-Localhost fallida"
        exit 1
    fi
}

localToPro() {
    echo "🔨  Exportando imagenes al servidor de produccion"
    rsync -avzhe "ssh" $PATH_UPLOADS/ josexs@carstournaments.com:${PATH_APPS_PRO}/uploads/carsTournaments/ > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Sincronizacion de imagenes Localhost-Servidor completada"
    else
        echo "❌  Sincronizacion de imagenes Localhost-Servidor fallida"
        exit 1
    fi
}

clear
logo

if [ "${TYPE}" = "proToLocal" ]; then
    proToLocal
elif [ "${TYPE}" = "localToPro" ]; then
    localToPro
else
    echo "❌  Tipo de sincronizacion de imagenes no reconocido"
    exit 1
fi