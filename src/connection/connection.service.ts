import { Injectable } from '@nestjs/common';
import { DbRequest } from './dto/db-request.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class ConnectionService {

    private connection;

    //Connecting to the database
    async initConnection(dbRequest: DbRequest) {
        //Here get fully configured and initialized DataSource object that you can use to interact with database.
        const connectionOptions = new DataSource({
            type: dbRequest.dbType,
            host: dbRequest.dbHost,
            port: dbRequest.dbPort,
            username: dbRequest.dbUserName,
            password: dbRequest.dbPassword,
            database: dbRequest.dbName,
        });

        //initialize() : this method is to set up and establish the database connection.
        try {
            console.log("Trying connection...");
            this.connection = await connectionOptions.initialize(); //this function will return the connection object
            console.log("connection ==> ",this.connection);
            return { message: `Database connection established successfully.` };
        } catch (error) {
            return { message: `Database connection failed : ${error.message}` };
        }
    }

    //To get the schema name
    async getSchemaName(dbType: string) {
        if (dbType === 'postgres') {
            const schema = this.connection.driver.schema;
            return { schemaName: schema }
        } else if (dbType === 'mysql') {
            const schema = this.connection.driver.database;
            return { schemaName: schema }
        }
    }

    //To get the list of the tables from the database by schemaname
    async getTableNames(schemaName: string): Promise<string[]> {
        const query = `
            SELECT table_name AS table_name
            FROM information_schema.tables
            WHERE table_schema = '${schemaName}'
            AND table_type = 'BASE TABLE';`;

        console.log(query);

        try {
            const results = await this.connection.query(query);
            console.log("results : ", results);
            return results.map((result) => result.table_name);
        } catch (error) {
            return error.message;
        }
    }

    //To get the fields of the table by passing tablename with schemaname
    async getTableFields(schemaName: string, tableName: string): Promise<string[]> {
        const query = `
            SELECT column_name AS column_name
            FROM information_schema.columns
            WHERE table_schema = '${schemaName}'
            AND table_name = '${tableName}'
            ORDER BY ordinal_position;`;

        try {
            const results = await this.connection.query(query);
            console.log(results);
            return results.map((result) => result.column_name);
        } catch (error) {
            return error.message;
        }
    }

    //To get the fields of the multiple table
    async getMultipleTableFields(schemaName: string, tableName1: string, tableName2: string): Promise<object> {
        const query1 = `
            SELECT column_name AS column_name
            FROM information_schema.columns
            WHERE table_schema = '${schemaName}'
            AND table_name = '${tableName1}'
            ORDER BY ordinal_position;`;
        const queryResult1 = await this.connection.query(query1);
        const result1: string[] = queryResult1.map((result) => result.column_name);
        console.log(result1);

        const query2 = `
            SELECT column_name AS column_name
            FROM information_schema.columns
            WHERE table_schema = '${schemaName}'
            AND table_name = '${tableName2}'
            ORDER BY ordinal_position;`;
        const queryResult2 = await this.connection.query(query2);
        const result2: string[] = queryResult2.map((result) => result.column_name);
        console.log(result2);

        const result = { [tableName1]: result1, [tableName2]: result2 };
        return result;
    }

    //To get the data from the table by tablename with specified column
    async getTableData(tableName: string, fields: string): Promise<any[]> {

        const query = `SELECT ${fields} FROM ${tableName};`;

        try {
            const results = await this.connection.query(query);
            console.log(results);
            return results;
        } catch (error) {
            return error.message;
        }
    }

    //To get the the fields of all the tables of a database
    async getFieldsFromAllTables(schemaName: string) {
        const query = `
            SELECT table_name AS table_name
            FROM information_schema.tables
            WHERE table_schema = '${schemaName}'
            AND table_type = 'BASE TABLE';`;
        const results = await this.connection.query(query);
        const tables: string[] = results.map((result) => result.table_name); //In tables var storing the array of tables
        console.log("tables :", tables);

        let fieldsWithTables: object = {};
        for (let i = 0; i < tables.length; i++) {
            fieldsWithTables[tables[i]] = await this.getTableFields(schemaName, tables[i]);
        }
        return fieldsWithTables;
    }

    //get the fields from the selected tables
    async getFieldsFromSelectedTables(schemaName: string, tableNames: string): Promise<object> {
        console.log("table names : ", tableNames);
        const tables = tableNames.split(",")
        console.log("tables : ", tables);

        let fieldsWithTables: object = {};

        for (let i = 0; i < tables.length; i++) {
            console.log("table : ", tables[i]);
            fieldsWithTables[tables[i]] = await this.getTableFields(schemaName, tables[i]);
        }
        return fieldsWithTables;
    }

    //To join two table
    async joinTwoTables(schemaName: string, tableName1: string, tableName2: string, field1: string, field2: string) {
        console.log(tableName1, tableName2, field1, field2);

        const query = `
            SELECT ${tableName1}.sname, ${tableName2}.area
            FROM ${tableName1}
            INNER JOIN ${tableName2} ON ${tableName1}.${field1} = ${tableName2}.${field2};`;
        console.log(query);

        // await this.connection.query(`USE ${schemaName};`);
        await this.connection.query(`SET search_path TO ${schemaName};`);
        const results = await this.connection.query(query);
        console.log(results);
        return results.map((result) => ({ sname: result.sname, area: result.area }))
    }

    //To perform joining condtion for two tables
    async joiningTables(dbType: string, schemaName: string, tableName1: string, tableName2: string, table1_columns: string, table2_columns: string) {

        const columns1 = table1_columns.split(",");
        console.log(tableName1, " : ", columns1);
        const columns2 = table2_columns.split(",");
        console.log(tableName2, " : ", columns2);

        const result = await this.checkRelation(dbType, tableName1, tableName2);

        if (result.length > 0) {

            const relation = result[0];
            console.log("relation : ", relation);

            let columnOftable1 = "";
            let columnOftable2 = "";
            for (let i = 0; i < columns1.length; i++) {
                if (i < columns1.length - 1) {
                    columnOftable1 = columnOftable1 + `${relation.secondary_table}.${columns1[i]},`
                } else {
                    columnOftable1 = columnOftable1 + `${relation.secondary_table}.${columns1[i]}`
                }
            }
            console.log("tc1 : ", columnOftable1);

            for (let i = 0; i < columns2.length; i++) {
                if (i < columns2.length - 1) {
                    columnOftable2 = columnOftable2 + `${relation.primary_table}.${columns2[i]},`
                } else {
                    columnOftable2 = columnOftable2 + `${relation.primary_table}.${columns2[i]}`
                }
            }
            console.log("tc2 : ", columnOftable2);

            if (dbType === 'postgres') {
                const query = `
                    SELECT
                        ${columnOftable1}, ${columnOftable2}
                    FROM
                        ${relation.secondary_table}
                    INNER JOIN
                        ${relation.primary_table}
                    ON
                        ${relation.secondary_table}."${relation.secondary_column}" = ${relation.primary_table}."${relation.primary_column}";
                `;
                console.log(query);
                const results = await this.connection.query(query);
                console.log("results : ", results);
                return results;
            } else if (dbType === 'mysql') {
                const query = `
                    SELECT
                        ${columnOftable1}, ${columnOftable2}
                    FROM
                        ${schemaName}.${relation.secondary_table}
                    INNER JOIN
                        ${schemaName}.${relation.primary_table}
                    ON
                        ${relation.secondary_table}.${relation.secondary_column} = ${relation.primary_table}.${relation.primary_column};
                `;
                console.log(query);
                const results = await this.connection.query(query);
                console.log("results : ", results);
                return results;
            }
        } else {
            return `Can't find join path to join '${tableName1}', '${tableName2}'`;
        }
    }

    //This method will give the secondary_column, secondary_table, primary_column, primary_table which required to perform join query.
    async checkRelation(dbType, tableName1, tableName2) {

        if (dbType === 'postgres') {
            const query = `
                SELECT
                    conname AS constraint_name,
                    conrelid::regclass AS primary_table,
                    a.attname AS primary_column,
                    confrelid::regclass AS secondary_table,
                    af.attname AS secondary_column
                FROM
                    pg_constraint AS c
                JOIN
                    pg_attribute AS a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
                JOIN
                    pg_attribute AS af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
                WHERE
                    (conrelid::regclass::text = '${tableName1}' AND confrelid::regclass::text = '${tableName2}')
                    OR
                    (conrelid::regclass::text = '${tableName2}' AND confrelid::regclass::text = '${tableName1}');
            `;
            return await this.connection.query(query);
        } else if (dbType === 'mysql') {
            const query = `
                SELECT
                    CONSTRAINT_NAME,
                    TABLE_NAME AS primary_table,
                    COLUMN_NAME AS primary_column,
                    REFERENCED_TABLE_NAME AS secondary_table,
                    REFERENCED_COLUMN_NAME AS secondary_column
                FROM
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE
                    (table_name = '${tableName1}' AND referenced_table_name = '${tableName2}')
                    OR
                    (table_name = '${tableName2}' AND referenced_table_name = '${tableName1}');
            `;
            return await this.connection.query(query);
        }
    }

    //joining multiple tables
    async joinMultipleTables(schemaName: string, dbType: string, tables: string, tableColumns: string) {

        const listOfTables = tables.split(",");
        console.log("listOfTables : ", listOfTables);

        let joinCount = 0;
        for (let i = 0; i < listOfTables.length; i++) {
            let count = 0;
            let joinTables = [];
            for (let j = 0; j < listOfTables.length; j++) {
                if (listOfTables[i] === listOfTables[j]) {
                    j = j + 1;
                }
                console.log("table names sending to check the relation: ", listOfTables[i], listOfTables[j]);
                const result = await this.checkRelation(dbType, listOfTables[i], listOfTables[j]);
                if (result.length > 0) {
                    if (count == 0) {
                        joinTables.push(listOfTables[i], listOfTables[j]);
                    } else {
                        joinTables.push(listOfTables[j]);
                    }
                    count = count + 1;
                }
            }
            console.log("count : ", count);

            if (count == (listOfTables.length - 1)) {
                console.log("joinTables : ", joinTables);
                console.log(`main table..... ${listOfTables[i]}`);
                const result = await this.checkMultipleTableRelation(dbType, joinTables);
                console.log("results : ", result);
                var mainTable = listOfTables[i];
                const joinQueryData = await this.dynamicJoinQuery(schemaName, dbType, tableColumns, mainTable, result)
                console.log(joinQueryData);
                return joinQueryData;
            }
            joinCount = count;
        }
        console.log("joinCount : ", joinCount);
        if (joinCount != (listOfTables.length - 1)) {
            let err = `Can't find join path to join`
                for(let i=0;i<listOfTables.length; i++){
                    if(i == listOfTables.length-1){
                        err = err + ' ' +`'${listOfTables[i]}'`;
                    }else{
                        err = err + ' ' +`'${listOfTables[i]}'` + ',';
                    }
                }
                return err;
        }
    }

    async dynamicJoinQuery(schemaName: string, dbType: string, tableColumns: string, mainTable: string, result) {
        console.log("dynamicJoinQuery data : ", schemaName, tableColumns, mainTable, result);

        if (dbType === 'postgres') {
            let query = `SELECT 
                        ${tableColumns}
                    FROM
                        ${schemaName}.${mainTable}`;

            const joinConditions = [];
            for (let i = 0; i < result.length; i++) {
                joinConditions.push(`
                LEFT JOIN
                    ${schemaName}.${result[i].primary_table} 
                ON
                    ${result[i].secondary_table}.${result[i].secondary_column} = ${result[i].primary_table}."${result[i].primary_column}"
            `);
            }
            query += joinConditions.join("");
            console.log("joining query : ", query);
            try {
                return await this.connection.query(query);
            } catch (error) {
                return error.message;
            }
        } else if (dbType === 'mysql') {
            let query = `SELECT 
                        ${tableColumns}
                    FROM
                        ${mainTable}`;

            const joinConditions = [];
            for (let i = 0; i < result.length; i++) {
                joinConditions.push(`
                LEFT JOIN
                    ${result[i].primary_table} 
                ON
                    ${result[i].secondary_table}.${result[i].secondary_column} = ${result[i].primary_table}.${result[i].primary_column}
            `);
            }
            query += joinConditions.join("");
            console.log("joining query : ", query);
            try {
                return await this.connection.query(query);
            } catch (error) {
                return error.message;
            }
        }
    }

    //check the relation of multiple tables dynamically
    async checkMultipleTableRelation(dbType: string, tables: string[]) {
        console.log("dbType : ", dbType);
        console.log("tables : ", tables);

        if (dbType === 'postgres') {
            const orConditions = [];
            let query = `
                SELECT
                    conname AS constraint_name,
                    conrelid::regclass AS primary_table,
                    a.attname AS primary_column,
                    confrelid::regclass AS secondary_table,
                    af.attname AS secondary_column
                FROM
                    pg_constraint AS c
                JOIN
                    pg_attribute AS a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
                JOIN
                    pg_attribute AS af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
                WHERE
            `;

            for (let i = 0; i < tables.length; i++) {
                for (let j = i + 1; j < tables.length; j++) {
                    orConditions.push(`
                        (conrelid::regclass::text = '${tables[i]}' AND confrelid::regclass::text = '${tables[j]}')
                        OR
                        (conrelid::regclass::text = '${tables[j]}' AND confrelid::regclass::text = '${tables[i]}')
                    `);
                }
            }
            query += orConditions.join(' OR ');

            console.log("query : ", query);
            return await this.connection.query(query);
        } else if (dbType === 'mysql') {
            const orConditions = [];
            let query = `
                SELECT
                    CONSTRAINT_NAME,
                    TABLE_NAME AS primary_table,
                    COLUMN_NAME AS primary_column,
                    REFERENCED_TABLE_NAME AS secondary_table,
                    REFERENCED_COLUMN_NAME AS secondary_column
                FROM
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE   
            `;

            for (let i = 0; i < tables.length; i++) {
                for (let j = i + 1; j < tables.length; j++) {
                    orConditions.push(`
                        (table_name = '${tables[i]}' AND referenced_table_name = '${tables[j]}')
                        OR
                        (table_name = '${tables[j]}' AND referenced_table_name = '${tables[i]}') 
                    `);
                }
            }
            query += orConditions.join(' OR ');

            console.log("query : ", query);
            return await this.connection.query(query);
        }
    }
}
