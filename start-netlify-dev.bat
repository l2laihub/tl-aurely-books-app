@echo off
REM Script to start Netlify dev server with the correct configuration

REM Check if Netlify CLI is installed
where netlify >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Netlify CLI is not installed. Installing...
    npm install -g netlify-cli
)

REM Check if .env.development exists
if not exist .env.development (
    echo Warning: .env.development file not found. Environment variables may not be loaded correctly.
) else (
    echo Found .env.development file. Loading environment variables...
    REM Load environment variables from .env.development
    for /f "tokens=*" %%a in (.env.development) do (
        set "%%a"
    )
)

REM Start Netlify dev server
echo Starting Netlify dev server...
netlify dev