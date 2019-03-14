import express from 'express';
import ExportDocument from './ExportsController';

const exportsRouter = express.Router();

/**
 * @swagger
 * /export/pdf:
 *  get:
 *    summary: export data to pdf
 *    tags:
 *      - Export
 *    parameters:
 *      - name: table
 *        in: query
 *        required: true
 *        description: name of database table to get data from
 *        type: string
 *      - name: sort
 *        in: query
 *        required: false
 *        type: string
 *      - name: department
 *        in: query
 *        required: false
 *        description: department to filter trip requests by
 *        type: string
 *      - name: dateFilters
 *        in: query
 *        required: false
 *        type: string
 *    responses:
 *      200:
 *        description: download the response
 */
exportsRouter.get('/export/pdf', ExportDocument.exportToPDF);

/**
 * @swagger
 * /export/csv:
 *  get:
 *    summary: export to csv
 *    tags:
 *      - Export
 *    responses:
 *      200
 */
exportsRouter.get('/export/csv', ExportDocument.exportToCSV);


export default exportsRouter;
