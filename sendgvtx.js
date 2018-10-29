/**
 * This file creates, signs, and sends GV to a user
 */

const config = require('./config')
const axios = require('axios')
const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon.stellar.org');
StellarSdk.Network.usePublicNetwork();

let fromUId = process.argv[2]
let toUId = process.argv[3]
let amount = process.argv[4]

sendTx()

async function sendTx() {
    let cjAsset = new StellarSdk.Asset(config.cjAssetCode, config.cjIssuer);
    
    // From
    let sourceSecretKey = process.argv[5]
    let sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    let sourcePublicKey = sourceKeypair.publicKey();
    let accountFromStellar = await server.loadAccount(sourcePublicKey)

	// To
	let toPublicKey = process.argv[6]

    let transaction = new StellarSdk.TransactionBuilder(accountFromStellar).addOperation(StellarSdk.Operation.payment({
            destination: toPublicKey,
            asset: cjAsset,
            amount: String(amount),
        }))
        .build();

    transaction.sign(sourceKeypair);

    let transactionResult = await server.submitTransaction(transaction)
        .catch(e => {
        	return process.send({
        		success: false,
        		error: e.response.data.extras
        	})
        })

    console.log("transactionResult: ", transactionResult)

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

    process.send({
    	success: true,
    	tx: txToSave
    })
}