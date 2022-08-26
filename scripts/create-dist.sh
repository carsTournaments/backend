dir=$(pwd)/builds/server

if [ -d $dir ];
then
    rm -r $dir
else
    mkdir $dir
fi