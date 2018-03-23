const fetch = require('node-fetch');

async function sell(req, res) {
    res.set('Access-Control-Allow-Origin', "*");
    res.set('Access-Control-Allow-Methods', 'GET');
    try {
        console.log('sell');
        // get config
        // query stocks we are holding
        // iterte through
        // get stock price
        // if lower than 1% (or whatever is in config) then sell
        // if higher than newest high, then set new high
        res.send({'success': 'sell'});
    } catch (error) {
        res.status(500).send({'error': error});
    }
}


module.exports = {
  sell,
};
