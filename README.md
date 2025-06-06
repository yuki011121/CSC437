# CSC437
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
