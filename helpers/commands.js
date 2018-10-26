const axios = require('axios')
const math = require('mathjs')

module.exports = {
    /**
     * Sets up the trustline to the CJ asset
     * @param  {Message} msg Discord Message
     * @return {String}
     */
    verify: async(msg) => {
    	helpers.replyToMsg(msg, "Verifying your account...")
    	let result = await stellar.setUpTrustline(msg.author.id)
    	helpers.replyToMsg(msg, result.message)
    },
    /**
     * Shows the user's balance
     * @param  {Message} msg Discord Message
     * @return {String}
     */
    balance: async(msg) => {
        let account = await DB.get('/users/' + msg.author.id)
        if (!account) return helpers.replyToMsg(msg, "You have no account yet!")

        let balances = await stellar.getBalances(account.publicKey)

        let sentences = [
            '\nYour Balances: '
        ]

        balances.forEach(bal => {
            let str

            if (bal.asset_type === 'native') {
                str = bal.balance + ' XLM'
            } else {
            	if(bal.asset_code === 'CJS'){
            		bal.balance = helpers.formatMoneyString(math.eval(bal.balance * 1e6)).substr(1)
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
        	'1. Create a new account by running `@gvtipbot /newaccount`. This will create your account',
        	'2. Send a small amount of XLM (we recommend 3 or more) to the public key that was sent to you',
        	'3. Check you balance by running `@gvtipbot /balance` - this will show you balance in XLM and GV. Once your XLM is in your wallet, you can verify your account. This will set up the trustline so that you can hold and send GV',
        	'4. Run `@gvtipbot /verify` to verify your account and set up your trustline',
        	'5. Send your wallet some GV and start tipping!',
        	'\n**Please note that all response messages from the bot are sent to you via Direct Message**',
            '\nCommand List: ',
            '`/market` - Lists current market data about CJs. This data is updated every 5 minutes',
            '`/help` - lists all commands (**you are here now!**)',
            '`/balance` - Lists the balance of your tipping wallet',
            '`/newaccount` - Creates a new wallet',
            '`/verify` - Sets up your trustline for CJS (make sure you have XLM in your account!)',
            '\nMore to come soon! Feel free to post in the `wacoinda-tech-heads` for any questions!'
        ]

        helpers.replyToMsg(msg, sentences.join('\n'))
    },
    newaccount: async(msg) => {
        let account = await DB.get('/users/' + msg.author.id)
        if (account) {
            return helpers.replyToMsg(msg, "You already have an account!")
        }

        account = await stellar.generateAccount(msg.author.id)
        helpers.replyToMsg(msg, "Account generated! Your public key is " + account.publicKey)
    }
}