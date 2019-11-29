@echo off

set NODE_ENV=production
set ROOT=%~dp0..

rm -rf %ROOT%\backend-build
mkdir %ROOT%\backend-build

call node12 %ROOT%/backend/main.js ../config/%1/snf-frontend.js --cache-require %ROOT%/backend-build/snf-frontend.json
call node12 %ROOT%/backend/main.js ../config/%1/snf-controller.js --cache-require %ROOT%/backend-build/snf-controller.json

set NODE_ENV=development
