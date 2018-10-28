module.exports = {
    /**
     * Runs the command passed in 
     * @param  {Message}    msg     A Discord Message
     * @param  {String}     command The command
     * @return {String}
     */
    runCommand: (msg, command) => {
        return commands[command](msg)
    },
    /**
     * Checks to see what command we will run, if any
     * @param  {String} message The text of the message
     * @return {String}
     */
    getCommand: (message) => {
        if (message.indexOf('/help') > -1) {
            return 'help'
        } else if (message.indexOf('/balance') > -1) {
            return 'balance'
        } else if (message.indexOf('/market') > -1) {
            return 'market'
        } else if (message.indexOf('/newaccount') > -1) {
            return 'newaccount'
        } else if (message.indexOf('/verify') > -1) {
            return 'verify'
        } else if (message.indexOf('/withdraw') > -1) {
            return 'withdraw'
        }
    },
    /**
     * Replys to the user that tagged the bot with the text passed in
     * @param  {Message}    msg  The Discord Message
     * @param  {String}     text The message to send back to the user
     * @return {Void}
     */
    replyToMsg: (msg, text) => {
        msg.author.send(text)
    },
    /**
     * Starts the cron job that will update the database with Coin Market Cap data
     * @return {Void}
     */
    startCMCCron: () => {
        var CronJob = require('cron').CronJob;
        new CronJob('*/5 * * * *', CoinMarketCap.getPriceAndVolume, null, true, 'America/New_York');
    },
    formatMoneyString: (num) => {
        return (num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    }
}