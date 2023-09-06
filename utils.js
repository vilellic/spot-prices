module.exports = {

    getAveragePrice: function (pricesList) {
        const prices = pricesList.map(row => Number(row.price))
        const sum = prices.reduce((acc, price) => acc + price, 0)
        const avg = sum / prices.length
        return Number((avg).toFixed(5)).toString()
    }

}