const axios = require('axios')
const math = require('mathjs')

module.exports = {
    /**
     * Withdraws an amount of GV to the provided Stellar address
     * @param  {Message} msg Discord Message
     * @return {Void}
     */
    withdraw: async(msg) => {
        helpers.replyToMsg(msg, "Starting withdraw...")
        let account = await DB.get('/users/' + msg.author.id)
        .catch(e => {
            console.log("error getting account in withdraw: ", e)
            return helpers.replyToMsg(msg, "There was an error creating your withdraw. Please try again.")
        })

        let toAddress = msg.content.split('/withdraw ')[1].trim()
        let withdrawResponse = await stellar.withdraw(msg.author.id, account, toAddress)
        .catch(e => {
            console.log("error in withdrawResponse: ", e)
            return helpers.replyToMsg(msg, "There was an error creating your withdraw. Please try again.")
        })

        helpers.replyToMsg(msg, "Your GV balance has successfully been sent to "  + toAddress + '!')

    },
    /**
     * Sets up the trustline to the CJ asset
     * @param  {Message} msg Discord Message
     * @return {String}
     */
    verify: async(msg) => {
        helpers.replyToMsg(msg, "Verifying your account...")
        let result = await stellar.setUpTrustline(msg.author.id)
        .catch(e => {
            console.log("error verify: ", e)
            return helpers.replyToMsg(msg, "There was an error verifying your account. Please try again")
        })
        helpers.replyToMsg(msg, result.message)
    },
    /**
     * Shows the user's balance
     * @param  {Message} msg Discord Message
     * @return {String}
     */
    balance: async(msg) => {
        let account = await DB.get('/users/' + msg.author.id)
        .catch(e => {
            console.log("error getting balacne: ", e)
            return helpers.replyToMsg(msg, "Sorry! There was an error getting your balance. Please try again.")
        })

        if (!account) return helpers.replyToMsg(msg, "You have no account yet!")

        let balances = await stellar.getBalances(account.publicKey)

        let sentences = [
            '\nYour Balances for public key ' + account.publicKey + ': '
        ]

        balances.forEach(bal => {
            let str

            if (bal.asset_type === 'native') {
                str = bal.balance + ' XLM'
            } else {
                if (bal.asset_code === 'CJS') {
                    bal.balance = helpers.formatMoneyString(math.eval(bal.balance * 1e6))
                    bal.asset_code = 'GV'
                }

                str = bal.balance + ' ' + bal.asset_code
            }

            sentences.push(str)
        })

        helpers.replyToMsg(msg, sentences.join('\n'))
    },
    /**
     * Returns data about to the market to the channel
     * @param  {Message} msg Discord Message
     * @return {String}
     */
    market: async(msg) => {
        let marketData = await DB.get('/market_data')

        let sentences = [
            '\nCurrent Market Data: ',
            'Price: ' + marketData.price,
            '24h Volume: ' + marketData.volume_24h,
            '% Change (1hr): ' + marketData.percent_change_1h,
            '% Change (24h): ' + marketData.percent_change_24h,
            '% Change (7d): ' + marketData.percent_change_7d,
            'Market Cap: ' + marketData.market_cap
        ]

        helpers.replyToMsg(msg, sentences.join('\n'))
    },
    /**
     * Returns a list of commands to the channel
     * @param  {Message} msg Discord Message
     * @return {String}
     */
    help: (msg) => {
        let sentences = [
            'Welcome to the Wacoinda GV Tipping Bot!\n',
            'If you want to start tipping users on Discord, there are a couple of things you need to do:\n',
            "1. Create a new account by running `@gvtipbot /newaccount`. This will create your account. Note that this is separate from your Fa'eva Wallet or StellarX Account",
            '2. Go to StellarX and click on "Wallet". On that page, there will be a tab that says "Send Tokens". Paste the public key from Discord and send 3 to 4 XLM, and hit "Send"',
            '3. Run `@gvtipbot /verify` to verify your account and set up your trustline',
            '4. Go back to StellarX, to the "Send Tokens" page, and send CJ to the Discord public key by clicking the dropdown and selecting "CJS". Remember that there are 1,000,000 GV in a CJ, so if you only want to fund it with 100,000 GV, you would send 0.1 CJ',
            '5. Check you balance by running `@gvtipbot /balance` - this will show you balance in XLM and GV.',
            '6. Start tipping!',
            '\n**Please note that all response messages from the bot are sent to you via Direct Message**',
            '\nCommand List: ',
            '`/market` - Lists current market data about CJs. This data is updated every 5 minutes',
            '`/help` - lists all commands (**you are here now!**)',
            '`/balance` - Lists the balance of your tipping wallet',
            '`/newaccount` - Creates a new wallet',
            '`/verify` - Sets up your trustline for CJS (make sure you have XLM in your account!)',
            '`/withdraw` - Sends your GV balance to the address of your choice. Run it like this: `@gvtipbot /withdraw GDIOHVA65FW4ZJDUHPFFWMCA7LOTNHCP3SK7YT4LETQKYJDBGWZQYDA3`',
            '\nMore to come soon! Feel free to post in the `wacoinda-tech-heads` for any questions!'
        ]

        helpers.replyToMsg(msg, sentences.join('\n'))
    },
    newaccount: async(msg) => {
        let account = await DB.get('/users/' + msg.author.id)
        if (account) {
            return helpers.replyToMsg(msg, "You already have an account! Your public key is " + account.publicKey)
        }

        account = await stellar.generateAccount(msg.author.id)
        .catch(e => {
            console.log("error creating account: ", e)
            return helpers.replyToMsg(msg, "There was an error creating your account. Please try again.")  
        })
        helpers.replyToMsg(msg, "Account generated! Your public key is " + account.publicKey)
    }
}