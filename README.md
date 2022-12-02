# DISCLAIMER: use at your own RISK!

### SCRIPT LOGIC

This script will load all your owned marimo NFTs and then read blockchain for gas price lower than gas price user config. When it passes the first condition it goes to the second condition that read for water clarity lower than user config. When all of that conditions passes the water will be changed automatically and all start over again.

### REQUIREMENTS

1. Install [Node.js](https://nodejs.org)
1. Install [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)

### INSTALLATION

1. Clone this repo or download and extract it
1. Choose your settings by editing config.json file

   ```
   {
   "clarityPercentThreshold": 81,  //trigger when lower than 81%
   "gasPrice": "10"                //trigger when lower than 10 gas price
   }
   ```

1. Rename example.env to .env and modify it to your credentials
   ```
   WSS_APIKEY=YOUR_WEB_SOCKET_API_KEY
   PRIVATE_KEY=YOUR_PRIVATE_KEY
   ```
1. Run yarn on project directory to install dependencies

   ```
   yarn
   ```

1. Start the script and monitorate logs to get information about what's going on
   ```
   yarn start
   ```

### ABOUT ME

I really enjoy automatization and I will use that satisfaction to learn programming. Fell free to ask for that kind of scripts at [@rotepfau](https://twitter.com/rotepfau). Apologize me for bad english, grammarly correction is welcome
