# Chat Application Frontend

icons are from https://www.svgrepo.com/

# How to start

Use this command to start the development environment 
``` npm run ios ```

To start tunneled environment that can be accessed through the internet 
```  npx expo start -c --tunnel ```

When running the app on actual device run
```  npx expo start --dev-client --tunnel ```

If you want to run multiple frontend instances you have to open multiple devices and open the 
app emulator in them, you dont have to run development server again.

## Export BE interface to FE
``` npx openapi-typescript http://localhost:8090/v3/api-docs -o api/schema.d.t ```