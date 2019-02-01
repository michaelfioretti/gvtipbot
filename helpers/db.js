var dump = require('level-dump')
var level = require('level')
var db = level('./db', {
    valueEncoding: 'json'
});

module.exports = {
    set: (key, value) => {
        return new Promise((resolve, reject) => {
            db.put(key, value, function(err) {
                if (err) return resolve(null)
                resolve(true)
            })
        })
    },
    get: (key) => {
        return new Promise((resolve, reject) => {
            db.get(key, function(err, value) {
                if (err) return resolve(null)
                resolve(value)
            })
        })
    },
    getAllTxs: () => {
        return new Promise((resolve, reject) => {
            let txs = []
            let key = '/transactions/'
            db.createReadStream({
                    gte: key,
                    lte: String.fromCharCode(key.charCodeAt(0) + 1)
                })
                .on('data', function(data) {
                    txs.push(data.value)
                })
                .on('end', function() {
                    return resolve(txs.length)
                })
        })
    }
}