# gvtipbot
A Discord bot that allows [Wacoinda](https://wacoinda.com/#!/) users to send Garveys (GV) to each other inside of Discord channels. The project uses NodeJS, the [Stellar JS API](https://github.com/stellar/js-stellar-sdk), and LevelDB for storage. It also uses the Coin Market Cap API for price data

## Installation
Clone the repo, then run the following
```
npm install
node app.js
```
*Note that you will need a valid `config.js` file*

## Installing the bot onto your server
Make sure you are an admin, then click the [following url](https://discordapp.com/oauth2/authorize?client_id=503515179041030155&scope=bot). Accept the conditions and the bot will be added.

## New Account Creation and Funding Process
If you want to start tipping users on Discord, there are a couple of things you need to do:

1. Create a new account by running `@gvtipbot /newaccount`. This will create your account
2. Send a small amount of XLM (at least 3 or more) to the public key that was sent to you
3. Check you balance by running `@gvtipbot /balance` - this will show you balance in XLM and GV. Once your XLM is in your wallet, you can verify your account. This will set up the trustline so that you can hold and send GV
4. Run `@gvtipbot /verify` to verify your account and set up your trustline
5. Send your wallet some GV and start tipping!

## How To Tip Users
In any Discord channel that the bot is in, tag the user you want to tip, give the amount, and then tag the tip bot. Some examples are:

- "*@userone Thanks for the help 100 GV @gvtipbot* - this will send 100 GV to @userone
- "*@thatdude 100,000 GV @gvtipbot*" - this will send 100,000 GV (0.1 CJ) to @thatdude

## Commands
- `/market` - Lists current market data about CJs. This data is updated every 5 minutes
- `/help` - lists all commands as well as the explanation above for setting up an account
- `/balance` - Lists the balance of your tipping wallet
- `/newaccount` - Creates a new wallet
- `/verify` - Sets up your trustline for CJS (make sure you have XLM in your account!)

## Donations
Not required, but appreciated!
Stellar: GA3WVSJNL7ZJVM4BB6KODGCFQFHLBRPK2DRQ5KDR5JFMMEWIAGLIW27R
Ethereum: 0xf933DefcD72f2e5B931a64b4d880BB0Fe855a14b