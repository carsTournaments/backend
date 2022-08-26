source $(pwd)/scripts/setenv.sh
source $(pwd)/scripts/utils/utils.sh

appOrAdmin=$1
path=""

if [ ${appOrAdmin} = "app" ]; then
    path=${PATH_APP}
else 
    path=${PATH_ADMIN}
fi

generate() {
    cd ${path} && ng build --configuration production > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Build finalizado"
    else
        echo "❌  Creacion de ${appOrAdmin} fallida"
        exit 1
    fi
}

deploy() {
    cd ${path} && firebase deploy> /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Deploy finalizado"
        if [ ${appOrAdmin} = "app" ]; then
            echo "💎  Ruta APP: https://carstournaments.com"
        else 
            echo "💎  Ruta ADMIN: https://admin.carstournaments.com"
        fi
    else
        echo "❌  Deploy de ${appOrAdmin} fallido"
        exit 1
    fi
}

clear
logo
echo "🔨  Generando PWA ${appOrAdmin}"
generate
deploy