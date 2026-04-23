import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { supabase } from '../utils/supabase';

// Helper para finalizar el PDF de forma segura en Serverless
const finalizePDF = (doc: PDFKit.PDFDocument, res: Response) => {
  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(true);
    });
    doc.end();
  });
};

export const generateReportePDF = async (req: Request, res: Response) => {
  try {
    const { data: serenatas, error: sError } = await supabase
      .from('serenatas')
      .select('*')
      .order('fecha', { ascending: false });

    if (sError) throw sError;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-mariachi.pdf');
    doc.pipe(res);

    doc.fillColor('#D4AF37').fontSize(25).text('EL MARIACHI AVENTURERO', { align: 'center' });
    doc.fillColor('#000000').fontSize(10).text('Reporte General de Actividades', { align: 'center' }).moveDown(2);

    serenatas?.forEach((s: any, i: number) => {
      doc.fontSize(10).fillColor('#333333')
        .text(`${i + 1}. ${s.fecha} - ${s.nombre_festejada} (${s.motivo || 'Evento'})`)
        .text(`   Cliente: ${s.nombre_cliente || 'N/A'} | Monto: $${s.precio_total?.toLocaleString()}`)
        .moveDown(0.5);
    });

    await finalizePDF(doc, res);
  } catch (error: any) {
    if (!res.headersSent) res.status(500).json({ error: 'Error al generar el reporte' });
  }
};

export const generateSerenataPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: s, error } = await supabase.from('serenatas').select('*').eq('id', id).single();

    if (error || !s) return res.status(404).json({ error: 'No encontrada' });

    const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=comprobante.pdf`);
    doc.pipe(res);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;

    // Fondo
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FFFFFF');
    doc.rect(0, 0, pageWidth, 150).fill('#000000');
    doc.rect(0, 150, pageWidth, 5).fill('#D4AF37');

    doc.font('Helvetica-Bold').fontSize(26).fillColor('#D4AF37').text('EL MARIACHI AVENTURERO', 0, 50, { align: 'center', width: pageWidth });
    doc.font('Helvetica').fontSize(10).fillColor('#FFFFFF').text('COMPROBANTE DE RESERVA OFICIAL', 0, 90, { align: 'center', width: pageWidth, characterSpacing: 2 });
    
    let y = 180;
    const drawRow = (label: string, value: string) => {
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#D4AF37').text(label.toUpperCase(), margin, y);
      doc.font('Helvetica').fontSize(12).fillColor('#000').text(value || '---', margin, y + 15);
      y += 45;
    };

    drawRow('Cliente que contrata', s.nombre_cliente);
    drawRow('Teléfono', s.telefono);
    drawRow('Para la festejada', s.nombre_festejada);
    drawRow('Motivo', s.motivo);
    drawRow('Fecha y Hora', `${s.fecha} a las ${s.hora}`);
    drawRow('Ubicación', `${s.direccion}, ${s.comuna}`);
    drawRow('Servicio', s.tipo === 'full' ? 'Serenata Completa (4 canciones)' : 'Serenata Express (2 canciones)');

    y += 20;
    doc.rect(margin, y, pageWidth - (margin * 2), 60).fill('#000000');
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#D4AF37').text('VALOR TOTAL', 0, y + 12, { align: 'center', width: pageWidth });
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#D4AF37').text(`$${s.precio_total?.toLocaleString()}`, 0, y + 28, { align: 'center', width: pageWidth });

    await finalizePDF(doc, res);
  } catch (error: any) {
    console.error('PDF ERROR:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Fallo generación PDF' });
  }
};
