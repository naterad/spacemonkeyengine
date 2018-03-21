const fetch = require('node-fetch');

async function slope(req, res) {
    res.set('Access-Control-Allow-Origin', "*");
    res.set('Access-Control-Allow-Methods', 'GET');
    try {
        console.log('analyze');
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

module.exports = {
    slope,
};
