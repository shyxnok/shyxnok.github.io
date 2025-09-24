#!bash

# folder_path=$(pwd)
echo -e "\n$folder_path"
for file in *.flf;do
    if [ -e "$file" ];then
        echo "$file"
    fi
done