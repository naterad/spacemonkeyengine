const express = require('express');

const analyzeController = require('./controllers/analyze');
const buyController = require('./controllers/buy');
const sellController = require('./controllers/sell');

const router = new express.Router();

router.route('/slope')
    .get(analyzeController.slope);

router.route('/buy')
    .get(buyController.buy);

router.route('/sell')
    .get(sellController.sell);

module.exports = router;
