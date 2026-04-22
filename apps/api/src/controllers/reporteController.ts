import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { supabase } from '../utils/supabase';

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

    doc.fontSize(14).text('Resumen de Serenatas', { underline: true }).moveDown();

    serenatas?.forEach((s: any, i: number) => {
      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(`${i + 1}. ${s.fecha} - ${s.nombre_festejada} (${s.motivo || 'Evento'})`)
        .text(`   Cliente: ${s.nombre_cliente || 'N/A'} | Monto: $${s.precio_total?.toLocaleString()}`)
        .moveDown(0.5);
    });

    const total = serenatas?.reduce((acc: number, s: any) => acc + (s.precio_total || 0), 0);
    doc.moveDown().fontSize(12).fillColor('#000000').text(`Total Generado: $${total?.toLocaleString()}`, { align: 'right' });

    doc.end();
  } catch (error: any) {
    res.status(500).json({ error: 'Error al generar el reporte PDF' });
  }
};

export const generateSerenataPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: s, error } = await supabase
      .from('serenatas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !s) return res.status(404).json({ error: 'Serenata no encontrada' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=comprobante-${s.id}.pdf`);
    doc.pipe(res);

    // Diseño Premium
    doc.rect(0, 0, 612, 120).fill('#111111');
    doc.fillColor('#D4AF37').fontSize(22).text('EL MARIACHI AVENTURERO', 50, 45, { characterSpacing: 2 });
    doc.fillColor('#FFFFFF').fontSize(8).text('COMPROBANTE DE RESERVA', 50, 75, { characterSpacing: 4 });

    doc.moveDown(5);
    doc.fillColor('#111111').fontSize(16).text('DETALLES DE LA SERENATA', { underline: true });
    doc.moveDown();

    const drawRow = (label: string, value: string) => {
      doc.fillColor('#666666').fontSize(10).text(label, { continued: true });
      doc.fillColor('#000000').fontSize(11).text(`  ${value}`).moveDown(0.8);
    };

    drawRow('Cliente que contrata:', s.nombre_cliente || 'N/A');
    drawRow('Nombre de la festejada:', s.nombre_festejada);
    drawRow('Motivo:', s.motivo || 'Presentación');
    drawRow('Fecha:', s.fecha);
    drawRow('Hora estimada:', s.hora || 'Por confirmar');
    drawRow('Dirección:', `${s.direccion}, ${s.comuna}`);
    drawRow('Tipo de Servicio:', s.tipo === 'full' ? 'Serenata Completa (4 canciones)' : 'Serenata Express (2 canciones)');

    doc.moveDown();
    doc.fillColor('#D4AF37').fontSize(14).text('REPERTORIO ELEGIDO', { underline: true }).moveDown();
    
    if (s.canciones && s.canciones.length > 0) {
      s.canciones.forEach((c: string, i: number) => {
        doc.fillColor('#333333').fontSize(10).text(`${i + 1}. ${c}`);
      });
    } else {
      doc.fillColor('#999999').fontSize(10).text('Sin canciones seleccionadas (A elección en el momento)');
    }

    doc.moveDown(2);
    doc.rect(50, doc.y, 512, 50).fill('#f9f9f9');
    doc.fillColor('#111111').fontSize(14).text(`VALOR TOTAL: $${s.precio_total?.toLocaleString()}`, 70, doc.y - 35, { align: 'center' });

    doc.moveDown(3);
    doc.fillColor('#999999').fontSize(8).text('Gracias por preferir al Mariachi Aventurero. ¡Nos vemos pronto!', { align: 'center' });

    doc.end();
  } catch (error: any) {
    res.status(500).json({ error: 'Error al generar el comprobante' });
  }
};
