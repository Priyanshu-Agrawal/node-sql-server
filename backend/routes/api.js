const express = require('express');
const router = express.Router();
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const config = require('../config');
const DBController = require('../controller/DBController');


const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);

        req.user = decoded.data;
        next();
    });
}


router.use('/', async (req, res, next) => {
    const isConnected = await DBController.checkDBConnection();
    console.log('Is DB connected?', isConnected);
    if (!isConnected)
        res.status(500).send('DB not connected');
    next();
})

router.get('/admin', authenticateToken, (req, res) => {
    if (req.user.AccessLevel <= 1) {
      res.json({ message: 'Admin route', user: req.user });
    } else {
      res.sendStatus(401);
    }
  });

router.get('/', async (req, res) => {
       res.sendFile(process.cwd() + '/public/API documentation.html');
    // data = await DBController.runQuery('select * from Student')
    // res.send(data);

    }
)

router.post('/call/authenticateUser', async (req, res) => {
    // console.log('procedure call trigerred');
    const procedureName = 'AuthenticateUser';
    const params = req.body.params;
    data = await DBController.runProcedure(procedureName, params)
    // res.send(data);
    if(data[0].Message == 'Login successful'){
        const token = jwt.sign({data}, process.env.JWT_SECRET);
        res.json({...data[0], token});
    }else{
        res.json(data[0]);
    }
    // console.log(token);
    
})

router.get('/getAll', async (req, res) => {
    query = `SELECT table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_catalog = '${process.env.DB_NAME}'`;
    data = await DBController.runQuery(query)
    res.json(data);     
})

/* router.get('/table/:tableName/', async (req, res) => {

    query = `select * from ${req.params.tableName}`
    // console.log(query);
    data = await DBController.runQuery(query)
    res.send(data);

    }
) */

router.get('/table/:tableName/', async (req, res) => {
    if(Object.keys(req.query).length === 0){
        query = `select * from ${req.params.tableName}`

    }else{
        const columnName  = Object.keys(req.query)[0];
        const columnValue = req.query[columnName];
        query = `select * from ${req.params.tableName} where ${columnName} LIKE ${columnValue} + '%'`
    }
    console.log(query);
    data = await DBController.runQuery(query)
    res.send(data);
})


router.get('/table/:tableName/:columnName/:columnValue', async (req, res) => {
    query = `select * from ${req.params.tableName} where ${req.params.columnName} = ${req.params.columnValue}`
    // console.log(query);
    data = await DBController.runQuery(query)
    res.send(data);
})


router.post('/call/:procedureName', async (req, res) => {
    // console.log('procedure call trigerred');
    const procedureName = req.params.procedureName;
    const params = req.body.params;
    data = await DBController.runProcedure(procedureName, params)
    res.send(data);
})

router.post('/table/:tableName/', async (req, res) => {
    query = await DBController.QueryBuilder.insertDataQuery(req.params.tableName, req.body);
    // console.log(query);
    data = await DBController.runQuery(query)
    res.send(data);
})


router.post('/table/:tableName/bulk', async (req, res) => {
    // data = req.body;
    const DummybulkData = [
        {
          "rollno": 1,
          "name": "John",
          "fathername": "David",
          "address": "123 Main St",
          "phoneno": "123-456-7890"
        }
    ]
    DBController.insertBulk(req.params.tableName, DummybulkData)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        console.error(err);
        res.send(err);
    })
})

router.put('/table/:tableName/', async (req, res) => {
    query = await DBController.QueryBuilder.updateDataQuery(req.params.tableName, req.body);
    data = await DBController.runQuery(query)
    res.send(data);
})

router.delete('/table/:tableName/all', async (req, res) => {
    query = `delete from ${req.params.tableName}`
    data = await DBController.runQuery(query)
    res.send(data);
})

router.delete('/table/:tableName/', async (req, res) => {
    query = await DBController.QueryBuilder.deleteDataQuery(req.params.tableName, req.body );
    // console.log(query);
    data = await DBController.runQuery(query)
    res.send(data);
})

router.post('/', (req, res) => {
     // connect to your database
     sql.connect(config, (err) => {

        if (err) console.log(err);

        // create Request object
        const request = new sql.Request();

        // query to the database and get the records
        request.query(`select * from ${req.body.table}`, function (err, recordset) {

            if (err) console.log(err)

            // send records as a response
            res.send(recordset);

        });
    });

})


module.exports = router