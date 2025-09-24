#!bash
# read -p
folder_path=$(pwd)



echo -e "\n$folder_path"
for file in *;do
    if [ -e "$file" ];then
        echo "$file"
    fi
done