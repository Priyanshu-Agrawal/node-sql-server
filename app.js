const sql = require('mssql');
require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const apiRouter = require('./routes/api');
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/api', apiRouter);
app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.listen(process.env.PORT, function () {
    console.clear()
    console.info('Express server listening on port %d in %s mode', this.address().port, app.settings.env);

    console.log(`Listening on port ${process.env.PORT}!`);
});
