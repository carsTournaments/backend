source $(pwd)/scripts/setenv.sh
source $(pwd)/scripts/utils/utils.sh
exec 2>$(pwd)/scripts/error.log

clear
logo
echo "🔥  Actualizando backend de produccion"

if [ -z "$CI" ]; then
    CI=false
fi

if [ "${NODE_ENV}" = "development" ]; then
    COMMAND="cd ${PATH_APPS_PRO}/carsTournaments-backend && npm run update"
    COMMANDS="bash -i -c '${COMMAND}'"
    if [ "$CI" = "true" ]; then
        echo "🔥  Actualizando desde CI"
        ssh -i ${SSH_KEY} -p ${SSH_PORT} ${SSH_HOST} ${COMMANDS} >/dev/null 2>&1
    else
        echo "🔥  Actualizando desde local"
        ssh ${SSH_HOST} ${COMMANDS} >/dev/null 2>&1
    fi
    if [ $? -eq 0 ]; then
        echo "✅  Actualizacion de backend desde local finalizada"
    else
        echo "❌  Actualizacion de backend desde local fallida"
        exit 1
    fi
else
    pm2 stop carsTournaments >/dev/null 2>&1
    PATH_BACKEND="${PATH_APPS_PRO}/carsTournaments-backend"
    echo "🔥  Actualizando backend desde Produccion"
    cd ${PATH_BACKEND} && git pull >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Pull finalizado"
    else
        echo "❌  Pull fallido"
        exit 1
    fi
    cd $PATH_BACKEND && npm i >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Instalacion de dependencias finalizada"
    else
        echo "❌  Instalacion de dependencias fallida"
        exit 1
    fi

    pm2 restart carsTournaments >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Pm2 finalizado"
    else
        echo "❌  Pm2 fallido"
        exit 1
    fi
fi
