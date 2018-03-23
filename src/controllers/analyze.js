const fetch = require('node-fetch');
const request = require('request');
const YahooFinanceAPI = require('yahoo-finance-data');
const Push = require('pushover-notifications');

const p = new Push( {
    user: "ux1if13ofopvk7u3k8w5q6d12uukfu",
    token: "ardxcuep4y7ay39kpus4cgrvqx7rgh",
})
 
const api = new YahooFinanceAPI({
  key: 'dj0yJmk9b3JUdnhjZ0ZXWEl1JmQ9WVdrOVlVZFhRbXR1TkdNbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1iNQ--',
  secret: 'c9a33fbb3dca28ecce32cace70ac989b6a4d3df7'
});

// dj0yJmk9b3JUdnhjZ0ZXWEl1JmQ9WVdrOVlVZFhRbXR1TkdNbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1iNQ--
// c9a33fbb3dca28ecce32cace70ac989b6a4d3df7


async function slope(req, res) {
    res.set('Access-Control-Allow-Origin', "*");
    res.set('Access-Control-Allow-Methods', 'GET');
    try {
        const fields = ['stock', 'close', 'change_percent', 'change_value', 'rating', 'volume', 'market_cap', 'price_to_earning', 'EPS_basic', 'EMP', 'sector'];
        const url = 'https://www.tradingview.com/markets/stocks-usa/market-movers-gainers/';
        let html = await getWebpage(url);
        let stocks = [];
        let minPercentOff = 10000;
        let minPercentStock = '';
        let regex = /class=\Dtv-screener__symbol\D href=\D\Dsymbols/gi, result, indices = [];
        while ( (result = regex.exec(html)) ) {
            indices.push(result.index);
        }
        for(let index of indices) {
            let stockObj = {};
            let chunck = html.substring(index, index + 1515);
            let stockStart = chunck.indexOf(">");
            let stockChunck = chunck.substring(stockStart + 1);
            var stockEnd = stockChunck.indexOf("</a>");
            var stock = stockChunck.substring(0, stockEnd);
            stockObj[fields[0]] = stock;

            let regex2 = /<td /gi, result2, indices2 = [];
            while ( (result2 = regex2.exec(chunck)) ) {
                indices2.push(result2.index);
            }
            let num = 0; 
            for(let index of indices2) {
                num += 1;
                let bit = stockChunck.substring(index, index + 200);
                let bitStart = bit.indexOf(">");
                let bitChunck = bit.substring(bitStart + 1, bitStart + 20);
                var bitEnd = bitChunck.indexOf("</td>");
                var stuff = bitChunck.substring(0, bitEnd);
                if(bit.indexOf('Buy') != -1) {
                    if(bit.indexOf('Strong') != -1) {
                        stuff = 'STRONG BUY';
                    } else {
                        stuff = 'BUY';
                    }
                }else if(bit.indexOf('Sell') != -1) {
                    if(bit.indexOf('Strong') != -1) {
                        stuff = 'STRONG SELL';
                    } else {
                        stuff = 'SELL';
                    }
                }
                stockObj[fields[num]] = stuff;
            }
            let volume = 0;
            let volumeStr = stockObj.volume;
            
            if(volumeStr != '&mdash;') {
                if(volumeStr.indexOf('K') != -1) {
                    let removed = volumeStr.replace('K','');
                    volume = parseFloat(removed) * 1000;
                }else if(volumeStr.indexOf('M') != -1) {
                    let removed = volumeStr.replace('M','');
                    volume = parseFloat(removed) * 1000000;
                }
            }
            // console.log(volume);
            if(volume > 150000) { // ADD TO CONFIG
                stockObj.volume = volume;
                try {
                    // const summary = await api.quoteSummary(stock);
                    // console.log(summary.quoteSummary.result);
                    let range = '1d'; // ADD TO CONFIG
                    let data = await api.getHistoricalData(stock, '5m', range);
                    let results = analyzeData(data, range);
    
                    // console.log(data.chart.result[0]);
                    if(results) {
                        stockObj['totalPercentOff_' + range] = results.totalPercentOff;
                        stockObj['avePercentOff_' + range] = results.avePercentOff
                        stockObj['dayPercentDiff_' + range] = results.dayPercentDiff;
                        // if(results.totalPercentOff != 0 && results.totalPercentOff < minPercentOff) {
                        //     minPercentOff = results.totalPercentOff;
                        //     minPercentStock = stockObj;
                        // }
                        // 3 days info
                        range = '3d'; // ADD TO CONFIG
                        data = await api.getHistoricalData(stock, '5m', range);
                        results = analyzeData(data, range);
                        if(results) {
                            stockObj['totalPercentOff_' + range] = results.totalPercentOff;
                            stockObj['avePercentOff_' + range] = results.avePercentOff
                            stockObj['dayPercentDiff_' + range] = results.dayPercentDiff;
                        }
                        stocks.push(stockObj);
                    }
                } catch(error) {
                    // console.log(error);
                }
            }
        }
        // console.log(indices.length);
        // console.log(stocks);
        const sorted = stocks.sort(compare);
        // SAVE THESE SORTED STOCKS
        // console.log(sorted);
        const topSorted = sorted.slice(0, 5); // CONFIG
        // console.log(topSorted);

        sendMessage(topSorted);
        // console.log(sorted.length);
        // console.log('======');
        // console.log(minPercentOff);
        // console.log(minPercentStock);

        // get market gainers, losers, most active, volitile, etc from trading view
        // scrub data and generte object of stock info
        // use yahoo/google to query stock and analyze slope
        // sort according to rank
        // send push notification
        // save them in datastore
        res.send({'success': 'analyze'});
    } catch (error) {
        res.status(500).send({'error': error});
    }
}

function compare(a,b) {
    if (a.totalPercentOff_1d < b.totalPercentOff_1d)
      return -1;
    if (a.totalPercentOff_1d > b.totalPercentOff_1d)
      return 1;
    return 0;
}
  
  
function getWebpage(url) {
    return new Promise(function (resolve, reject) {
      request(url, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            resolve(body);
        } else {
            reject(error);
        }
      });
    });
}

function analyzeData(data, time) {
    const opens = data.chart.result[0].indicators.quote[0].open;
    const start = opens[0];
    const end = opens[opens.length - 1];
    const diff = end - start;
    if(diff < 0) {
        return null;
    }
    const steps = opens.length - 1;
    const increment = diff/steps;
    if(increment == 0 || steps == 0 || diff == 0) {
        return null;
    }
    let shouldBe = start;
    let totalPercentOff = 0;
    let nulls = 0;
    for(let real of opens) {
        if(real) {
            const delta = Math.abs(shouldBe - real);
            // console.log('delta');
            // console.log(delta);
            if(delta < 0) {
                console.log('THIS IS LESS THAN ZERO');
            }
            const percent = delta / diff * 100;
            totalPercentOff += percent;            
        } else {
            nulls += 1;
        }
        shouldBe += increment;
    }
    const avePercentOff = totalPercentOff / (opens.length - nulls);
    // console.log(totalPercentOff);
    // console.log(avePercentOff);
    const dayPercentDiff = (end - start) / start * 100;
    // console.log(dayPercentDiff);
    return {
        totalPercentOff: totalPercentOff,
        avePercentOff: avePercentOff,
        dayPercentDiff: dayPercentDiff,
        range: time
    }
}

function sendMessage(stocks) {
    // console.log(stocks);
    const msg = {
        message: formatMessage(stocks),	// required
        device: 'nates-iphone'
    }
    p.send(msg, ( err, result ) => {
        if ( err ) {
          throw err
        }
    })
}

function formatMessage(stocks) {
    let message = '';
    for(let stock of stocks) {
        // { stock: 'TV',
        // close: '15.30',
        // change_percent: '4.94%',
        // change_value: '0.72',
        // rating: 'SELL',
        // volume: 9492000,
        // market_cap: '14.764B',
        // price_to_earning: '27.22',
        // EPS_basic: '0.93',
        // EMP: '43502.00',
        // sector: '',
        // totalPercentOff_1d: 997.4994389722932,
        // avePercentOff_1d: 12.78845434579863,
        // dayPercentDiff_1d: 5.620686761264143 },
        message += 'stock: ' + stock.stock + '\n';
        message += 'percent change: ' + stock.change_percent + '\n';
        message += 'rating: ' + stock.rating + '\n';
        message += 'volume: ' + stock.volume + '\n';
        message += 'value change: ' + stock.change_value + '\n';
        message += 'total % off 1d: ' + stock.totalPercentOff_1d + '\n';
        if(stock.totalPercentOff_3d) {
            message += 'total % off 3d: ' + stock.totalPercentOff_3d + '\n';
        }
        message += '----------------\n';
    }
    return message;
}

module.exports = {
    slope,
};
