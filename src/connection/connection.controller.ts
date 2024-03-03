import { Body, Controller, Get, InternalServerErrorException, Param, Post } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { DbRequest } from './dto/db-request.dto';

@Controller('connection')
export class ConnectionController {
    constructor(
        private readonly connectionService: ConnectionService,
    ) { }

    @Post('/dbConnection')
    async configureDatabase(@Body() dbRequest: DbRequest) {
        try {
            return await this.connectionService.initConnection(dbRequest);
        } catch (error) {
            throw new InternalServerErrorException({
                messsage: error.messsage,
                status: 500
            });
        }
    }

    @Get('/schema/:dbType')
    async getSchemaName(@Param('dbType') dbType: string) {
        try {
            return await this.connectionService.getSchemaName(dbType);
        } catch (error) {
            throw new InternalServerErrorException({
                message: error.message,
                statusCode: 500
            });
        }
    }

    @Get('/tables/:schemaName')
    async getTableNames(@Param('schemaName') schemaName: string) {
        try {
            return await this.connectionService.getTableNames(schemaName);
        } catch (error) {
            throw new InternalServerErrorException({
                message: error.message,
                statusCode: 500
            });
        }
    }

    //   @Get('/fields/:schemaName/:tableName')
    //   async getTableFields(@Param('schemaName') schemaName: string, @Param('tableName') tableName: string): Promise<string[]> {
    //     const tableFields = await this.connectionService.getTableFields(schemaName, tableName);
    //     return tableFields;
    //   }

    //   @Get('/multipleFields/:schemaName/:tableName1/:tableName2')
    //   async getMultipleTableFields(@Param('schemaName') schemaName: string,
    //     @Param('tableName1') tableName1: string,
    //     @Param('tableName2') tableName2: string
    //   ): Promise<object> {
    //     const tableFields = await this.connectionService.getMultipleTableFields(schemaName, tableName1, tableName2);
    //     return tableFields;
    //   }

    //   @Get('/data/:tableName/:fields')
    //   async getTableData(@Param('tableName') tableName: string, @Param('fields') fields: string): Promise<any[]> {
    //     const tableData = await this.connectionService.getTableData(tableName, fields);
    //     return tableData;
    //   }

    //   @Get('/fieldsOfAllTables/:schemaName')
    //   async getFieldsFromAllTables(@Param('schemaName') schemaName: string) {
    //     const tableNames = await this.connectionService.getFieldsFromAllTables(schemaName);
    //     return tableNames;
    //   }

    //   @Get('/fieldsOfSelectedTable/:schemaName/:tableNames')
    //   async getFieldsFromSelectedTables(@Param('schemaName') schemaName: string, @Param('tableNames') tableNames: string): Promise<object> {
    //     const tableFields = await this.connectionService.getFieldsFromSelectedTables(schemaName, tableNames);
    //     return tableFields;
    //   }

    //   @Get('/join/:schemaName/:tableName1/:tableName2/:field1/:field2/')
    //   async joinTwoTables(@Param('schemaName') schemaName: string,
    //     @Param('tableName1') tableName1: string,
    //     @Param('tableName2') tableName2: string,
    //     @Param('field1') field1: string,
    //     @Param('field2') field2: string) {
    //     return await this.connectionService.joinTwoTables(schemaName, tableName1, tableName2, field1, field2);
    //   }

    //   @Get('/joining/:dbType/:schemaName/:tableName1/:tableName2/:table1_columns/:table2_columns')
    //   async joiningTables(@Param('dbType') dbType: string,
    //     @Param('schemaName') schemaName: string,
    //     @Param('tableName1') tableName1: string,
    //     @Param('tableName2') tableName2: string,
    //     @Param('table1_columns') table1_columns: string,
    //     @Param('table2_columns') table2_columns: string){
    //     return await this.connectionService.joiningTables(dbType, schemaName, tableName1, tableName2, table1_columns, table2_columns);
    //   }

    //   @Get('/joinMultipleTables/:schemaName/:dbType/:tables/:tableColumns')
    //   async joinMultipleTables(@Param('schemaName') schemaName: string,
    //       @Param('dbType') dbType: string,
    //       @Param('tables') tables: string,
    //       @Param('tableColumns') tableColumns: string){
    //     return await this.connectionService.joinMultipleTables(schemaName, dbType, tables, tableColumns);
    //   }
}
