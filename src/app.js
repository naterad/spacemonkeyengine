const bodyParser = require('body-parser');
const express = require('express');
const registerRoutes = require('./registerRoutes');
const PORT = process.env.PORT || 8081;
const app = express()

app.use(bodyParser.json())
app.use(registerRoutes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});