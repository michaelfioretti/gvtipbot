const axios = require('axios')
const cjId = config.coinMarketCap.cjId

module.exports = {
    /**
     * Gets CJ data from Coin Market Cap and updates the database
     * @return {Void}
     */
    getPriceAndVolume: async() => {
        let marketData = await axios('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=' + cjId, {
            headers: {
                'X-CMC_PRO_API_KEY': config.coinMarketCap.apiKey
            }
        })

        let priceData = marketData.data.data[cjId].quote.USD

        let saved = await DB.set('/market_data', {
            price: '$' + helpers.formatMoneyString(priceData.price),
            volume_24h: '$' + helpers.formatMoneyString(priceData.volume_24h),
            percent_change_1h: priceData.percent_change_1h.toFixed(2) + '%',
            percent_change_24h: priceData.percent_change_24h.toFixed(2) + '%',
            percent_change_7d: priceData.percent_change_7d.toFixed(2) + '%',
            market_cap: '$' + helpers.formatMoneyString(priceData.market_cap),
            last_updated: priceData.last_updated
        })
    }
}