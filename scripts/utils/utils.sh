# Colores
white=$(echo "\033[0;37m")
red=$(echo "\033[31m")
yellow=$(echo "\033[33m")
green=$(echo "\033[32m")
grey=$(echo "\033[90m")

colorPrimary=$white
colorSecondary=$yellow
colorError=$red
colorSuccess=$green

logo() {
    printf "${red} ########   ######## ${white}\n"
    printf "${red} ##    ##      ##  ${white}\n"
    printf "${red} ##            ##  ${white}\n"
    printf "${red} ##            ##  ${white}\n"
    printf "${red} ##            ##  ${white}\n"
    printf "${red} ##    ##      ##  ${white}\n"
    printf "${red} ########      ##  ${white}\n"
    printf "\n"
}
