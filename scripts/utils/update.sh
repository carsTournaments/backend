source $(pwd)/scripts/setenv.sh
source $(pwd)/scripts/utils/utils.sh
exec 2>$(pwd)/scripts/error.log

clear
logo
echo "🔥  Actualizando backend de produccion"

if [ "${NODE_ENV}" = "development" ]; then
    COMMAND="cd /home/josexs/apps/carsTournaments-backend/carsTournaments-backend && npm run update"
    COMMANDS="bash -i -c '${COMMAND}'"
  
    echo "🔥  Actualizando desde local"
    ssh ${SSH_HOST} ${COMMANDS} >/dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "✅  Actualizacion de backend desde local finalizada"
    else
        echo "❌  Actualizacion de backend desde local fallida"
        exit 1
    fi
else
    pm2 stop carsTournaments >/dev/null 2>&1
    PATH_BACKEND="/home/josexs/apps/carsTournaments-backend"
    echo "🔥  Actualizando backend desde Produccion"
    cd /home/josexs/apps/carsTournaments-backend && git checkout . && git pull >/dev/null 2>&1
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
