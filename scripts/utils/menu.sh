menuContinue() {
    echo ""
    echo "Pulsa cualquier tecla para continuar"
    read -n 1 -s
    echo
}

initMenu() {
    clear
    logo
    printf "${white}-${yellow} 1)${colorPrimary} Generar APK firmada ${white}\n"
    printf "${white}-${yellow} 2)${colorPrimary} Generar AAB firmado ${white}\n"
    printf "${white}-${yellow} 3)${colorPrimary} Subir AAB a Google Play ${red}(Proximamente) ${white}\n"
    printf "${white}-${yellow} 4)${colorPrimary} Deploy PWA App/Admin ${white}\n"
    printf "${white}-${yellow} 5)${colorPrimary} Backup DB ${white}\n"
    printf "${white}-${yellow} 6)${colorPrimary} Backup Imagenes ${white}\n"
    printf "${white}-${yellow} 7)${colorPrimary} Actualizar servidor ${white}\n"
    printf "${white}-${yellow} 8)${colorPrimary} Salir ${white}\n"
    echo ""
    read -p "Selecciona: " option
    echo ""
    case $option in
    1)
        menuAPK
        initMenu
        ;;
    2)
        sh ${PATH_SCRIPTS}/utils/aab.sh
        menuContinue
        initMenu
        ;;
    3)
        menuPWA
        initMenu
        ;;
    4)
        menuPWA
        initMenu
        ;;
    5)
        menuDB
        initMenu
        ;;
    6)
        menuImages
        initMenu
        ;;
    7)
        sh ${PATH_SCRIPTS}/utils/update.sh
        menuContinue
        initMenu
        ;;
    8)
        exit 0
        ;;
    *)
        echo "❌ Option no valida"
        exit 0
        ;;
    esac
}

menuAPK() {
    clear
    logo
    printf "${white}-${yellow} 1)${colorPrimary} Generar APK firmada ${white}\n"
    printf "${white}-${yellow} 2)${colorPrimary} Generar APK firmada e instalar en dispositivo ${white}\n"
    printf "${white}-${yellow} 3)${colorPrimary} Salir ${white}\n"
    echo ""
    read -p "Selecciona: " option
    echo ""
    case $option in
    1)
        sh ${PATH_SCRIPTS}/utils/apk.sh
        menuContinue
        ;;
    2)
        checkAdb
        sh ${PATH_SCRIPTS}/utils/apk.sh
        menuContinue
        ;;
    3)
        exit 0
        ;;
    *)
        echo "❌ Option no valida"
        exit 0
        ;;
    esac
}

menuPWA() {
    clear
    logo
    printf "${white}-${yellow} 1)${colorPrimary} Generar y subir PWA de APP ${white}\n"
    printf "${white}-${yellow} 2)${colorPrimary} Generar y subir PWA de Admin ${white}\n"
    printf "${white}-${yellow} 3)${colorPrimary} Salir ${white}\n"
    echo ""
    read -p "Selecciona: " option
    echo ""
    case $option in
    1)
        sh ${PATH_SCRIPTS}/utils/pwa.sh app
        menuContinue
        ;;
    2)
        sh ${PATH_SCRIPTS}/utils/pwa.sh admin
        menuContinue
        ;;
    3)
        exit 0
        ;;
    *)
        echo "❌ Option no valida"
        exit 0
        ;;
    esac
}

menuDB() {
    clear
    logo
    printf "${white}-${yellow} 1)${colorPrimary} Base de datos de PRO a UAT ${white}\n"
    printf "${white}-${yellow} 2)${colorPrimary} Base de datos de PRO a TEST ${white}\n"
    printf "${white}-${yellow} 3)${colorPrimary} Base de datos de UAT a PRO ${red}(CUIDADO) ${white}\n"
    printf "${white}-${yellow} 4)${colorPrimary} Base de datos de UAT a TEST ${white}\n"
    printf "${white}-${yellow} 5)${colorPrimary} Salir ${white}\n"
    echo ""
    read -p "Selecciona: " option
    echo ""
    case $option in
    1)
        sh ${PATH_SCRIPTS}/utils/database.sh proToUat
        menuContinue
        ;;
    2)
        sh ${PATH_SCRIPTS}/utils/database.sh proToTest
        menuContinue
        ;;
    3)
        echo "🔥  ATENCION: Puedes liarla muy parda"
        menuContinue
        sh ${PATH_SCRIPTS}/utils/database.sh uatToPro
        menuContinue
        ;;
    4)
        sh ${PATH_SCRIPTS}/utils/database.sh uatToTest
        menuContinue
        ;;
    5)
        exit 0
        ;;
    *)
        echo "❌ Option no valida"
        exit 0
        ;;
    esac
}

menuImages() {
    clear
    logo
    printf "${white}-${yellow} 1)${colorPrimary} Imagenes de PRO a LOCAL ${white}\n"
    printf "${white}-${yellow} 2)${colorPrimary} Imagenes de LOCAL a PRO ${red}(CUIDADO) ${white}\n"
    printf "${white}-${yellow} 3)${colorPrimary} Salir ${white}\n"
    echo ""
    read -p "Selecciona: " option
    echo ""
    case $option in
    1)
        sh ${PATH_SCRIPTS}/utils/images.sh proToLocal
        menuContinue
        ;;
    2)
        echo "🔥  ATENCION: Puedes liarla muy parda"
        menuContinue
        sh ${PATH_SCRIPTS}/utils/images.sh localToPro
        menuContinue
        ;;
    3)
        exit 0
        ;;
    *)
        echo "❌ Option no valida"
        exit 0
        ;;
    esac
}