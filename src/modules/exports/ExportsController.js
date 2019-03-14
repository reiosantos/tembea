import ExportData from '../../utils/ExportData';

class ExportDocument {
  static async exportToPDF(req, res) {
    const { table } = req.query;
    const pdf = await ExportData.createPDF(req.query);

    pdf.pipe(res);
    pdf.end();

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${table}.pdf`
    });
  }

  static exportToCSV(req, res) {
    const { name } = req.body;
    return res.status(200).json({
      success: true,
      message: `${name}.csv exported successfully!`
    });
  }
}

export default ExportDocument;
