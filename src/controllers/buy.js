const fetch = require('node-fetch');
const Push = require('pushover-notifications');

const p = new Push( {
    user: "ux1if13ofopvk7u3k8w5q6d12uukfu",
    token: "ardxcuep4y7ay39kpus4cgrvqx7rgh",
})

async function buy(req, res) {
    res.set('Access-Control-Allow-Origin', "*");
    res.set('Access-Control-Allow-Methods', 'GET');
    try {
        console.log('buy');
        // check datastore configs to see if autobuy is on
        // query datastore to see if there are any that we need to buy
        // make whatever buy according to information

        const msg = {
            // These values correspond to the parameters detailed on https://pushover.net/api
            // 'message' is required. All other values are optional.
            message: 'omg node test',	// required
            title: "Well - this is fantastic",
            sound: 'magic',
            device: 'nates-iphone',
            priority: 1
        }

        p.send(msg, ( err, result ) => {
            if ( err ) {
              throw err
            }
            // console.log( result )
        })
        
        res.send({'success': 'buy'});
    } catch (error) {
        res.status(500).send({'error': error});
    }
}

module.exports = {
  buy,
};



