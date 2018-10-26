config = require('./config')

// Initialize Discord and set variables
const Discord = require('discord.js')
const client = new Discord.Client()
const Helpers = require('./helpers')
const math = require('mathjs')
const fork = require('child_process').fork

DB = Helpers.DB
helpers = Helpers.Helpers
stellar = Helpers.Stellar
commands = Helpers.Commands
CoinMarketCap = Helpers.CoinMarketCap
helpers.startCMCCron()

client.on('ready', () => console.log('Bot started'));

client.on('message', async msg => {

    /*
      Scenarios

      1. User sends CJ to someone not on the platform:
        - Create new account for user
        - Send two messages:
          - First for tx confirmation
          - Second to TOUSER in a private DM that gives them
          their account address
      2. Balance confirmation BEFORE going through tx process
      3. Test with live CJ (need to fund with GV and XLM)
      4. Finish the following endpoints
        - /withdraw <address>
  
      5. Add comments and clean up code and add license and README
      6. Test with private group of 10 - 20 people
     */

    // Prevent bots from calling the bot
    if (msg.author.bot) return

    var fromUid = msg.author.id
    var fromUsername = msg.author.username
    var toUid = ''
    var toUsername = ''
    var tipbotMentioned = false
    var uid = ''
    var user = null
    var toUserObject = null
    var username = ''

    var text = msg.content.replace(/<@\!*([0-9]+)>/g, function(match, contents, offset, input_string) {
        uid = match.replace(/^<@\!*/, '').replace(/>$/, '')
        user = msg.mentions.users.get(uid)

        if (user !== null && typeof user !== 'undefined') {
            if (Object.keys(user).indexOf('username') > -1) {
                username = user.username
            }

            if (username.toLowerCase() === 'gvtipbot' && uid !== fromUid) {
                tipbotMentioned = true
            }

            if (uid !== fromUid && username !== 'gvtipbot') {
                if (toUid === '') {
                    toUid = uid
                    toUsername = username
                    toUserObject = user
                }
            }
        }
    })

    var valid = msg.content.indexOf('GV') > -1 && tipbotMentioned
    var command = helpers.getCommand(msg.content)

    if (command && tipbotMentioned) {
        return helpers.runCommand(msg, command)
    } else {
        let messageString = msg.content
        messageString = messageString.substr(messageString.indexOf('>'), messageString.length)
        messageString = messageString.substr(0, messageString.indexOf('<@'))
        var tipAmount = messageString.replace(/[^0-9.]/g, "").trim()

        if (valid && tipbotMentioned) {
            let userAccount = await DB.get('/users/' + fromUid)

            if (!userAccount) {
                helpers.replyToMsg(msg, "You currently do not have an account! Generating one now...")
                let account = await stellar.generateAccount(fromUid)
                helpers.replyToMsg(msg, "Your public key is " + account.publicKey + ". Make sure you fund this account with GV/CJ and XLM!")
            } else if (isNaN(tipAmount) || tipAmount === 0 || tipAmount < 0) {
                helpers.replyToMsg(msg, 'Invalid tip amount!')
            } else if (toUid === '') {
                helpers.replyToMsg(msg, 'Cannot detect who you wanted to tip, please mention the user to be tipped :innocent:')
            } else if (fromUid === toUid) {
                helpers.replyToMsg(msg, 'You cannot tip yourself')
            } else {
                let toAccount = await DB.get('/users/' + toUid)

                if (!toAccount) {
                    return helpers.replyToMsg(msg, "Sorry! " + toUsername + " hasn't set up an account yet! Tell them to make an account and fund it with XLM!")
                }

                console.log("this many GV: ", tipAmount)
                console.log("converting to CJ...")
                let cjValue = math.eval(tipAmount / 1e6)
                createAndSendTxToStellar(msg, fromUid, toUid, cjValue, tipAmount)
            }
        }

    }
});

client.login(config.discord.secret);

async function createAndSendTxToStellar(msg, fromUid, toUid, amount, gvValue) {
    var accounts = await Promise.all([DB.get('/users/' + fromUid), DB.get('/users/' + toUid)])
    var sendtxfork = fork('sendtx.js', [
        fromUid,
        toUid,
        amount,
        accounts[0].secret,
        accounts[1].publicKey
    ])

    sendtxfork.on('message', async (m) => {
        if(m.success) {
            let saved = await DB.set('/transactions/' + fromUid + '/' + m.tx.hash, m.tx)
            helpers.replyToMsg(msg, 'Transaction sent! You can view it at the following link: ' + m.tx.link)
            msg.channel.send('Big thanks to <@' + fromUid + '> for sending <@' + toUid + '> ' + helpers.formatMoneyString(Number(gvValue)) + ' GV!')
        } else {
            helpers.replyToMsg(msg, "There was an error sending your transaction! Sorry about that :frowning: please try again")
        }

        // Kill child since we don't need it anymore (\m/)
        sendtxfork.kill('SIGHUP');
    });
}