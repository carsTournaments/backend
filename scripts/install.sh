source $(pwd)/scripts/setenv.sh

checkEnvFile() {}

createDirs () {
    if [ ! -d $PATH_UPLOADS ];
    then
        mkdir $PATH_UPLOADS
    fi

}

installNpm() {
    if [ ! -d $PATH_PROJECT/node_modules ];
        npm install
    fi
}

checkEnvFile()
createDirs();
installNpm();