const fetch = require('node-fetch');

async function sell(req, res) {
    res.set('Access-Control-Allow-Origin', "*");
    res.set('Access-Control-Allow-Methods', 'GET');
    try {
        console.log('sell');
        res.send({'success': 'sell'});
    } catch (error) {
        res.status(500).send({'error': error});
    }
}


module.exports = {
  sell,
};
