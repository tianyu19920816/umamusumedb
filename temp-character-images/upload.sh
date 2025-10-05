#!/bin/bash
cd /Users/neo/Desktop/umamusumedb/temp-character-images/

for file in *.png; do
  echo "上传: $file"
  wrangler r2 object put umamusume-images/characters/$file --file=$file --content-type=image/png --remote
done

echo "所有图片上传完成！"
