# CSC437
cd packages/proto
cd packages/server
npm run start --workspace=proto
cd packages/app
npm run dev
npm run build
npm run start:app


push:
cd ~/path/to/CSC437 
git status
git add .
git commit -m "Lab 15. Forms with MVU and Messages"
git push origin main
