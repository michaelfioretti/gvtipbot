const axios = require('axios')
const DB = require('./db')
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon.stellar.org');
StellarSdk.Network.usePublicNetwork();

module.exports = {
    withdraw: (fromUId, account, toAddress) => {
        return new Promise(async(resolve, reject) => {
            let cjAsset = new StellarSdk.Asset(config.cjAssetCode, config.cjIssuer);
            let sourceKeypair = StellarSdk.Keypair.fromSecret(account.secret);
            let sourcePublicKey = sourceKeypair.publicKey();
            let accountFromStellar = await server.loadAccount(sourcePublicKey)
            let balances = await stellar.getBalances(account.publicKey)
            let cjBalance = null

            balances.forEach(b => {
                if (b.asset_code && b.asset_code === config.cjAssetCode) {
                    cjBalance = b.balance
                }
            })

            let transaction = new StellarSdk.TransactionBuilder(accountFromStellar).addOperation(StellarSdk.Operation.payment({
                    destination: toAddress,
                    asset: cjAsset,
                    amount: cjBalance,
                }))
                .build();

            transaction.sign(sourceKeypair);

            let transactionResult = await server.submitTransaction(transaction)
                .catch(e => {
                    console.log(e.response.data.extras)
                    return reject(e)
                })

            let txToSave = {
                hash: transactionResult.hash,
                fromPublicKey: sourcePublicKey,
                toPublicKey: toAddress,
                fromUId: fromUId,
                link: transactionResult._links.transaction.href,
                amount: cjBalance,
                denomination: 'CJ',
                createdAt: new Date().toISOString()
            }

            let saved = await DB.set('/transactions/' + fromUId + '/' + transactionResult.hash, txToSave)

            resolve(txToSave)
        })
    },
    setUpTrustline: (uid) => {
        return new Promise(async(resolve, reject) => {
            let userAccount = await DB.get('/users/' + uid)

            if (userAccount.verified) {
                return resolve({
                    message: 'Your account has already been verified!'
                })
            }

            let accountFromStellar = await server.loadAccount(userAccount.publicKey)
            let keypair = StellarSdk.Keypair.fromSecret(userAccount.secret);

            var transaction = new StellarSdk.TransactionBuilder(accountFromStellar)
                .addOperation(StellarSdk.Operation.changeTrust({
                    asset: new StellarSdk.Asset(config.cjAssetCode, config.cjIssuer)
                }))
                .build();

            transaction.sign(keypair);

            let transactionResult = await server.submitTransaction(transaction)
                .catch(e => {
                    console.log("there was an error setting up trustline for account " + uid)
                    console.log("error: ", e)

                    return resolve({
                        message: "There was an error setting up your trustline. Sorry about that! Please try again."
                    })
                })
            userAccount.verified = true
            let saved = await DB.set('/users/' + uid, userAccount)

            resolve({
                account: userAccount,
                message: "Trustline has been set up!"
            })
        })
    },
    generateAccount: (uid) => {
        return new Promise(async(resolve, reject) => {
            let random = StellarSdk.Keypair.random();
            let account = {
                publicKey: random.publicKey(),
                secret: random.secret()
            }

            let savedAccount = await DB.set('/users/' + uid, account)

            return resolve(account)
        })
    },
    getBalances: (publicKey) => {
        return new Promise(async(resolve, reject) => {
            let data = await axios("https://horizon.stellar.org/accounts/" + publicKey)
            return resolve(data.data.balances)
        })
    },
    createTransaction: (fromUId, toUId, amount) => {
        return new Promise(async(resolve, reject) => {
            let cjAsset = new StellarSdk.Asset(config.cjAssetCode, config.cjIssuer);
            let accounts = await Promise.all([DB.get('/users/' + fromUId), DB.get('/users/' + toUId)])
            let sourceSecretKey = accounts[0].secret
            let sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
            let sourcePublicKey = sourceKeypair.publicKey();
            let accountFromStellar = await server.loadAccount(sourcePublicKey)
            let toPublicKey = accounts[1].publicKey

            let transaction = new StellarSdk.TransactionBuilder(accountFromStellar).addOperation(StellarSdk.Operation.payment({
                    destination: toPublicKey,
                    asset: cjAsset,
                    amount: String(amount),
                }))
                .build();

            transaction.sign(sourceKeypair);

            let transactionResult = await server.submitTransaction(transaction)
                .catch(e => {
                    console.log(e.response.data.extras)
                    return reject(e)
                })

            let txToSave = {
                hash: transactionResult.hash,
                fromPublicKey: sourcePublicKey,
                toPublicKey: toPublicKey,
                toUId: toUId,
                fromUId: fromUId,
                link: transactionResult._links.transaction.href,
                amount: amount,
                denomination: 'GV',
                createdAt: new Date().toISOString()
            }

            let saved = await DB.set('/transactions/' + fromUId + '/' + transactionResult.hash, txToSave)

            resolve(txToSave)
        })
    }
}