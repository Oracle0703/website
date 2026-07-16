@echo off
setlocal
cd /d "%~dp0"

if not defined HOSTNAME set "HOSTNAME=127.0.0.1"
if not defined PORT set "PORT=3001"

node apps\website\server.js
