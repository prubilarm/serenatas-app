import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { supabase } from '../utils/supabase';

const finalizePDF = (doc: PDFKit.PDFDocument, res: Response) => {
  return new Promise((resolve) => {
    doc.on('end', () => resolve(true));
    doc.end();
  });
};

export const generateReportePDF = async (req: Request, res: Response) => {
  try {
    const { data: serenatas, error: sError } = await supabase.from('serenatas').select('*').order('fecha', { ascending: false });
    if (sError) throw sError;
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-mariachi.pdf');
    doc.pipe(res);
    doc.fillColor('#D4AF37').fontSize(25).text('EL MARIACHI AVENTURERO', { align: 'center' });
    doc.fillColor('#000000').fontSize(10).text('Reporte General de Actividades', { align: 'center' }).moveDown(2);
    serenatas?.forEach((s: any, i: number) => {
      doc.fontSize(10).fillColor('#333333').text(`${i + 1}. ${s.fecha} - ${s.nombre_festejada} (${s.motivo || 'Evento'})`).text(`   Cliente: ${s.nombre_client || 'N/A'} | Monto: $${s.precio_total?.toLocaleString()}`).moveDown(0.5);
    });
    await finalizePDF(doc, res);
  } catch (error: any) { if (!res.headersSent) res.status(500).json({ error: 'Fallo reporte' }); }
};

export const generateSerenataPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: s, error } = await supabase.from('serenatas').select('*').eq('id', id).single();
    if (error || !s) return res.status(404).json({ error: 'No encontrada' });
    const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=reserva.pdf`);
    doc.pipe(res);
    doc.rect(0, 0, 595.28, 841.89).fill('#FFFFFF');
    doc.rect(0, 0, 595.28, 150).fill('#000000');
    doc.rect(0, 150, 595.28, 5).fill('#D4AF37');
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#D4AF37').text('EL MARIACHI AVENTURERO', 0, 50, { align: 'center', width: 595.28 });
    doc.font('Helvetica').fontSize(10).fillColor('#FFFFFF').text('COMPROBANTE DE RESERVA', 0, 90, { align: 'center', width: 595.28, characterSpacing: 2 });
    let y = 180;
    const drawRow = (l: string, v: string) => { 
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#D4AF37').text(l.toUpperCase(), 50, y);
        doc.font('Helvetica').fontSize(12).fillColor('#000').text(v || '---', 50, y + 15);
        y += 45;
    };
    drawRow('Cliente', s.nombre_cliente);
    drawRow('Para', s.nombre_festejada);
    drawRow('Fecha y Hora', `${s.fecha} - ${s.hora}`);
    drawRow('Ubicación', `${s.direccion}, ${s.comuna}`);
    y += 10;
    doc.rect(50, y, 495.28, 60).fill('#000000');
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#D4AF37').text(`VALOR TOTAL: $${s.precio_total?.toLocaleString()}`, 50, y + 20, { align: 'center', width: 495.28 });
    await finalizePDF(doc, res);
  } catch (error: any) { if (!res.headersSent) res.status(500).json({ error: 'Fallo PDF' }); }
};

// NUEVO: Comprobante de Pago (Finalización)
export const generatePagoPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: s, error } = await supabase.from('serenatas').select('*').eq('id', id).single();
    if (error || !s) return res.status(404).json({ error: 'No encontrada' });
    const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=pago.pdf`);
    doc.pipe(res);
    doc.rect(0, 0, 595.28, 841.89).fill('#FFFFFF');
    // Header Verde Esmeralda y Dorado para Pago
    doc.rect(0, 0, 595.28, 150).fill('#0D0D0D');
    doc.rect(0, 150, 595.28, 5).fill('#2ecc71');
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#2ecc71').text('EL MARIACHI AVENTURERO', 0, 50, { align: 'center', width: 595.28 });
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF').text('COMPROBANTE DE PAGO EXITOSO', 0, 95, { align: 'center', width: 595.28, characterSpacing: 2 });
    let y = 200;
    const drawRow = (l: string, v: string) => { 
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#2ecc71').text(l.toUpperCase(), 50, y);
        doc.font('Helvetica').fontSize(12).fillColor('#000').text(v || '---', 50, y + 15);
        y += 45;
    };
    drawRow('Cliente Cornet', s.nombre_cliente);
    drawRow('Servicio Realizado para', s.nombre_festejada);
    drawRow('Fecha del Servicio', s.fecha);
    drawRow('Tipo de Serenata', s.tipo?.toUpperCase());
    y += 20;
    doc.rect(50, y, 495.28, 80).fill('#0D0D0D');
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#2ecc71').text('TOTAL PAGADO', 0, y + 15, { align: 'center', width: 595.28 });
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#2ecc71').text(`$${s.precio_total?.toLocaleString()}`, 0, y + 35, { align: 'center', width: 595.28 });
    y += 120;
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#000').text('¡GRACIAS POR PREFERIR NUESTROS SERVICIOS!', 0, y, { align: 'center', width: 595.28 });
    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#666').text('Hicimos de este momento algo inolvidable.', 0, y + 25, { align: 'center', width: 595.28 });
    await finalizePDF(doc, res);
  } catch (error: any) { if (!res.headersSent) res.status(500).json({ error: 'Fallo Pago PDF' }); }
};
