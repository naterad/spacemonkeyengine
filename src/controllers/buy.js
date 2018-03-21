const fetch = require('node-fetch');

async function buy(req, res) {
    res.set('Access-Control-Allow-Origin', "*");
    res.set('Access-Control-Allow-Methods', 'GET');
    try {
        console.log('buy');
        // check datastore configs to see if autobuy is on
        // query datastore to see if there are any that we need to buy
        // make whatever buy according to information
        
        res.send({'success': 'buy'});
    } catch (error) {
        res.status(500).send({'error': error});
    }
}

module.exports = {
  buy,
};
