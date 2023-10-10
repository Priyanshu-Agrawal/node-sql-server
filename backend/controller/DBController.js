const sql = require('mssql')
const config = require('../config')

const checkDBConnection = async () => {
    try {
        await sql.connect(config)
        console.log('Connection successful')
        return true
    } catch (err) {
        console.error('Error:', err)
        return errorsExtracter(err)
    }
}

const runQuery = async (query) => {
    try {
        await sql.connect(config);
        const result = await sql.query(query);
        return result.recordset ?? result;
    } catch (err) {
        console.error('Error:', err)
        return errorsExtracter(err)
    }
}


const insertBulk = async (tableName, dataArray) => {
    try {
        await sql.connect(config)
        const tableColumns = Object.keys(dataArray[0]).join(', ')

        const table = new sql.Table(tableName)
        table.create = true

        Object.keys(dataArray[0]).forEach(column => {
            table.columns.add(column, sql.VarChar(sql.MAX))
        })

        dataArray.forEach(data => {
            table.rows.add(...Object.values(data));
        })

        const request = new sql.Request();
        await request.bulk(table)

        return true
    } catch (err) {
        console.error('Error:', err)
        return errorsExtracter(err) ?? err
    }
}


const QueryBuilder = {
    insertDataQuery: async (tableName, data) => {
        const tableColumns = Object.keys(data).join(', ')
        const columnValues = Object.values(data).map(value => `'${value}'`).join(', ')
        const query = `INSERT INTO ${tableName} (${tableColumns}) VALUES (${columnValues})`
        return query
    },

    
    updateDataQuery: async (tableName, data) => {
        const keyColumnName = Object.keys(data)[0]
        const keyColumnValue = data[keyColumnName]
        const tableColumns = Object.keys(data).slice(1).map(column => `${column} = '${data[column]}'`).join(', ')
        const query = `UPDATE ${tableName} SET ${tableColumns} WHERE ${keyColumnName} = ${keyColumnValue}`
        // const query = `UPDATE ${tableName} SET  WHERE ${keyColumnName} = ${keyColumnValue}`;
        return query
    },

    deleteDataQuery: async (tableName, data) => {
        const columnName = Object.keys(data)[0]
        const columnValue = data[columnName]
        const query = `DELETE FROM ${tableName} WHERE ${columnName} = ${columnValue}`
        return query
    }
}


const runProcedure = async (procedureName, params) => {
    // console.log('Running procedure')
    try {
      await sql.connect(config)
  
      // Build the parameter string for the stored procedure
      const paramPlaceholders = params.map((_, index) => `@param${index}`).join(', ')
  
      // Build the SQL query
      const query = `EXEC ${procedureName} ${paramPlaceholders}`

      console.log("Procedure query:", query)
  
      const request = new sql.Request()
      params.forEach((param, index) => {
        request.input(`param${index}`, param)
      });
  
      const result = await request.query(query)
    //   console.log("Procedure result:", result.recordset)
      return result.recordset ?? result
    } catch (err) {
      console.error('Error:', err)
      return errorsExtracter(err)
    }
  }

  
const errorsExtracter = async (errorObject) =>{
    // const errorMessages = [errorObject.message, ...errorObject.precedingErrors.map(error => error.message)]
    return errorObject;
}

module.exports = {
    checkDBConnection, runQuery, QueryBuilder, insertBulk, runProcedure
};
