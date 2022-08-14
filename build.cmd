rmdir /S /Q ".\server\dist\public" &
xcopy /S /I /E "./web-client/build" "./server/dist/public"