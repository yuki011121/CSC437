# CSC437
cd packages/proto
cd packages/server
npm run start --workspace=proto
cd packages/app
npm run dev
npm run start:app


push:
cd ~/path/to/CSC437 
git status
git add .
git commit -m "Lab 14. MVU and State Management "
git push origin main
