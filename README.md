# CSC437
tree -L 2
docker build -t cooking-assistant .
docker rm my-cooking-app
docker run -d -p 3000:3000 --name my-cooking-app cooking-assistant

cd packages/proto
cd packages/server
npm run start --workspace=proto

npm run dev

cd packages/app
npm run build

cd packages/server
npm run start:app


push:
cd ~/path/to/CSC437 
git status
git add .
git commit -m "Deploy to VPS after Lab 15"
git push origin main

ps aux | grep 'node.*dist/index.js'
kill <PID>
cd packages/server
nohup npm run start:app &
