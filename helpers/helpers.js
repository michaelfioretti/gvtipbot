module.exports = {
    runCommand: (msg, command) => {
        return commands[command](msg)
    },
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
        }
    },
    replyToMsg: (msg, text) => {
        msg.author.send(text)
    },
    startCMCCron: () => {
        var CronJob = require('cron').CronJob;
        new CronJob('*/5 * * * *', CoinMarketCap.getPriceAndVolume, null, true, 'America/New_York');
    },
    formatMoneyString: (num) => {
        return (num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    }
}