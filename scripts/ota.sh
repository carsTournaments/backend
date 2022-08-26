# crear paquete ng build --prod
# zipear el paquete
# subir el paquete a uploads de produccion

source $(pwd)/scripts/setenv.sh

PATH_UPLOADS_OTA=${PATH_APPS_PRO}/uploads/carsTournaments/ota

cd ${PATH_APP} && ng build --configuration production
cd ${PATH_APP} && zip -rqo www.zip ./www
scp -i ${SSH_KEY} ./www.zip  ${SSH_HOST}:${PATH_UPLOADS_OTA}/www.zip
rm -r ./www.zip