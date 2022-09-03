# Sirve para hacer una exportacion de la base de datos en cualquier entorno

source $(pwd)/scripts/setenv.sh
source $(pwd)/scripts/utils/utils.sh
exec 2>$(pwd)/scripts/error.log

TYPE=${1} # proToUat / proToTest / uatToPro / uatToTest

COLLECTIONS=('brands' 'cars' 'images' 'inscriptions' 'likes' 'literals' 'menus' 'notifications' 'otas' 'pairings' 'reports' 'rounds' 'settings' 'toggles' 'tournaments' 'users' 'votes' 'winners')

proToUat() {
    mongoD ${MONGO_URI_PRO}
    deleteAll ${MONGO_URI_UAT}
    mongoR ${MONGO_URI_UAT}
}

uatToPro() {
    echo "uatToPro CUIDADO"
    mongodump --uri=${MONGO_URI_UAT} -o ${PATH_DB}
    deleteAll "uatToPro"
    mongorestore --uri=${MONGO_URI_PRO} ${PATH_DB}/CarsTournaments
}

uatToTest() {
    echo "uatToTest"
    mongodump --uri=${MONGO_URI_UAT} -o ${PATH_DB}
    deleteAll "uatToTest"
    mongorestore --uri=${MONGO_URI_TEST} ${PATH_DB}/CarsTournaments
}

proToTest() {
    echo "proToTest"
    mongodump --uri=${MONGO_URI_PRO} -o ${PATH_DB}
    deleteAll ${MONGO_URI_UAT}
    mongorestore --uri=${MONGO_URI_TEST} ${PATH_DB}/CarsTournaments
}

mongoD() {
    mongodump --uri="${1}" -o ${PATH_DB} > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Backup $TYPE finalizado"
    else
        echo "❌  Backup $TYPE fallido"
        exit 1
    fi
}

deleteAll() {
    EVAL=''
    for i in "${COLLECTIONS[@]}"
    do
        EVAL="${EVAL} db.${i}.deleteMany({});"
    done
    mongosh "$1" -eval "${EVAL}" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Borrado $TYPE finalizado"
    else
        echo "❌  Borrado $TYPE fallido"
        exit 1
    fi
}

mongoR() {
    mongorestore --uri="${1}" ${PATH_DB}/CarsTournaments > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅  Restore $TYPE finalizado"
    else
        echo "❌  Restore $TYPE fallido"
        exit 1
    fi
}

init() {
    echo "🔥  Iniciando backup de la base de datos"
    if [ "$TYPE" = "proToUat" ]; then
        proToUat
    elif [ "$TYPE" = "proToTest" ]; then
        proToTest
    elif [ "$TYPE" = "uatToPro" ]; then
        uatToPro
    elif [ "$TYPE" = "uatToTest" ]; then
        uatToTest
    else
        echo "❌  No se ha especificado el tipo"
        exit 1;
    fi
}

clear
logo
init

#TODO: Añadir borrado de cache segun env