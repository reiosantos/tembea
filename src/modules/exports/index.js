import { Router } from 'express';
import ExportDocument from './ExportsController';
import middlewares from '../../middlewares';

const exportsRouter = Router();
const { TokenValidator } = middlewares;

exportsRouter.use('/export',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken);

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
 *    summary: export data to csv
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
 *        description: success
 */
exportsRouter.get('/export/csv', ExportDocument.exportToCSV);


export default exportsRouter;
