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
    const { data: s, error } = await supabase
      .from('serenatas').select('*, clientes(nombre, telefono)').eq('id', id).single();
    if (error || !s) return res.status(404).json({ error: 'No encontrada' });

    const nombreCliente = s.nombre_cliente || (s as any).clientes?.nombre || 'N/A';
    const telefono = (s as any).clientes?.telefono || '';
    const fechaFmt = s.fecha
      ? new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Por definir';
    const precio = s.precio_total ? `$ ${Number(s.precio_total).toLocaleString('es-CL')}` : '$ 0';
    const tipoStr = String(s.tipo || 'estandar');
    const tipo = tipoStr.charAt(0).toUpperCase() + tipoStr.slice(1);

    const folio = id.slice(0, 8).toUpperCase();
    const hoy = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });

    const W = 595.28;
    const H = 841.89;
    const GOLD = '#C9A84C';
    const COL_L = 45;
    const COL_R = W / 2 + 20;

    const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=reserva-${folio}.pdf`);
    doc.pipe(res);

    // Fondo
    doc.rect(0, 0, W, H).fill('#0A0A0A');
    // Franja dorada top
    doc.rect(0, 0, W, 8).fill(GOLD);
    // Header block
    doc.rect(0, 8, W, 160).fill('#111111');
    // Separador dorado doble
    doc.rect(0, 168, W, 1.5).fill(GOLD);
    doc.rect(0, 172, W, 0.5).fillOpacity(0.3).fill(GOLD).fillOpacity(1);

    // Marca / nombre
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD)
       .text('EL MARIACHI AVENTURERO', 0, 32, { align: 'center', width: W, characterSpacing: 4 });
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#FFFFFF')
       .text('CONFIRMACION DE RESERVA', 0, 52, { align: 'center', width: W });
    doc.font('Helvetica').fontSize(9).fillColor('#666666')
       .text(`Folio #${folio}  -  Emitido el ${hoy}`, 0, 92, { align: 'center', width: W });

    // Badge tipo servicio
    const bw = 130; const bx = (W - bw) / 2;
    doc.roundedRect(bx, 112, bw, 26, 13).fill(GOLD);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000')
       .text(`SERVICIO ${tipo.toUpperCase()}`, bx, 119, { align: 'center', width: bw, characterSpacing: 1 });

    // Helper campos
    let y = 198;
    const field = (label: string, value: string, x: number, fw: number) => {
      doc.font('Helvetica-Bold').fontSize(7).fillColor(GOLD)
         .text(label, x, y, { width: fw, characterSpacing: 1.5 });
      doc.font('Helvetica').fontSize(13).fillColor('#FFFFFF')
         .text(value || '-', x, y + 11, { width: fw });
    };
    const sep = () => {
      y += 45;
      doc.rect(COL_L, y - 3, W - 90, 0.5).fillOpacity(0.12).fill('#FFFFFF').fillOpacity(1);
    };

    const halfW = W / 2 - 65;

    // Fila 1
    field('CLIENTE SOLICITANTE', nombreCliente, COL_L, halfW);
    field('DEDICADO A', s.nombre_festejada || 'N/A', COL_R, halfW); sep();
    // Fila 2
    field('MOTIVO / COMENTARIO', s.motivo || s.mensaje_especial || 'N/A', COL_L, halfW);
    field('TELEFONO CONTACTO', telefono || 'N/A', COL_R, halfW); sep();
    // Fila 3
    field('FECHA Y HORA DEL EVENTO', `${s.hora || '--:--'} hrs  -  ${fechaFmt}`, COL_L, W - 90); sep();
    // Fila 4
    field('UBICACION DEL EVENTO', `${s.direccion || 'N/A'}, ${s.comuna || ''}`, COL_L, halfW);
    field('TIPO DE SERENATA', tipo, COL_R, halfW); sep();
    // Fila 5 — canciones
    const canciones = Array.isArray((s as any).canciones) && (s as any).canciones.length > 0
      ? (s as any).canciones.join('  -  ')
      : 'A eleccion del cliente';
    field('CANCIONES ELEGIDAS', canciones, COL_L, W - 90); sep();

    // Bloque precio
    y += 20;
    doc.roundedRect(COL_L, y, W - 90, 82, 12).fill('#161616');
    doc.roundedRect(COL_L, y, W - 90, 82, 12).stroke(GOLD).lineWidth(1.5);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD)
       .text('VALOR TOTAL DEL SERVICIO', COL_L, y + 16, { align: 'center', width: W - 90, characterSpacing: 2 });
    doc.font('Helvetica-Bold').fontSize(36).fillColor('#FFFFFF')
       .text(precio, COL_L, y + 32, { align: 'center', width: W - 90 });

    // Footer
    const footerY = H - 80;
    doc.rect(0, footerY, W, 80).fill('#111111');
    doc.rect(0, footerY, W, 1.5).fill(GOLD);
    doc.font('Helvetica-Oblique').fontSize(10).fillColor(GOLD)
       .text('"Hacemos de cada momento algo inolvidable"', 0, footerY + 20, { align: 'center', width: W });
    doc.font('Helvetica').fontSize(8).fillColor('#555555')
       .text('El Mariachi Aventurero  -  Los Angeles, Chile', 0, footerY + 42, { align: 'center', width: W });
    doc.font('Helvetica').fontSize(7).fillColor('#2A2A2A')
       .text(`Documento generado automaticamente  -  Ref: ${folio}`, 0, footerY + 57, { align: 'center', width: W });
    // Franja dorada bottom
    doc.rect(0, H - 8, W, 8).fill(GOLD);

    await finalizePDF(doc, res);
  } catch (error: any) { if (!res.headersSent) res.status(500).json({ error: 'Fallo PDF' }); }
};

// NUEVO: Comprobante de Pago (Finalización)
export const generatePagoPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Buscamos la serenata por ID
    const { data: s, error } = await supabase
      .from('serenatas')
      .select('*, clientes(nombre, telefono)')
      .eq('id', id)
      .single();

    if (error || !s) return res.status(404).json({ error: 'No encontrada' });

    const folio = id.slice(0, 8).toUpperCase();
    const nombreCliente = s.nombre_cliente || (s as any).clientes?.nombre || 'Particular';
    const fechaFmt = s.fecha
      ? new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : '---';

    const W = 595.28;
    const H = 841.89;
    const GOLD = '#C9A84C';
    const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=comprobante-pago-${folio}.pdf`);
    doc.pipe(res);

    // Fondo
    doc.rect(0, 0, W, H).fill('#0A0A0A');
    doc.rect(0, 0, W, 8).fill(GOLD);
    
    // Header
    doc.rect(0, 8, W, 160).fill('#111111');
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD).text('EL MARIACHI AVENTURERO', 0, 35, { align: 'center', width: W, characterSpacing: 4 });
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#FFFFFF').text('COMPROBANTE DE PAGO', 0, 55, { align: 'center', width: W });
    doc.font('Helvetica').fontSize(9).fillColor('#666666').text(`Transacción #${folio}  -  Confirmación de Servicio Realizado`, 0, 95, { align: 'center', width: W });

    // Badge de Éxito
    doc.roundedRect((W-100)/2, 115, 100, 22, 11).fill(GOLD);
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000').text('PAGADO ✅', (W-100)/2, 122, { align: 'center', width: 100 });

    doc.rect(0, 168, W, 1.5).fill(GOLD);

    // Datos
    let y = 220;
    const row = (label: string, value: string) => {
      doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD).text(label, 60, y, { characterSpacing: 1 });
      doc.font('Helvetica').fontSize(14).fillColor('#FFFFFF').text(value || '---', 60, y + 12);
      y += 55;
    };

    row('CLIENTE', nombreCliente);
    row('SERENATA PARA', s.nombre_festejada);
    row('MOTIVO', s.motivo);
    row('FECHA DEL SERVICIO', fechaFmt);
    row('UBICACIÓN', `${s.direccion}, ${s.comuna}`);

    // Caja de Total
    y += 20;
    doc.roundedRect(60, y, W - 120, 100, 15).fill('#161616');
    doc.roundedRect(60, y, W - 120, 100, 15).stroke(GOLD).lineWidth(2);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(GOLD).text('TOTAL RECIBIDO', 60, y + 25, { align: 'center', width: W - 120 });
    doc.font('Helvetica-Bold').fontSize(42).fillColor('#FFFFFF').text(`$${Number(s.precio_total).toLocaleString('es-CL')}`, 60, y + 42, { align: 'center', width: W - 120 });

    // Footer
    const footerY = H - 100;
    doc.rect(0, footerY, W, 100).fill('#111111');
    doc.rect(0, footerY, W, 1).fill(GOLD);
    doc.font('Helvetica-Bold').fontSize(12).fillColor(GOLD).text('¡MUCHAS GRACIAS POR TU PREFERENCIA!', 0, footerY + 30, { align: 'center', width: W });
    doc.font('Helvetica-Oblique').fontSize(9).fillColor('#444444').text('Hicimos de este momento algo inolvidable.', 0, footerY + 50, { align: 'center', width: W });
    doc.rect(0, H-8, W, 8).fill(GOLD);

    await finalizePDF(doc, res);
  } catch (error: any) { if (!res.headersSent) res.status(500).json({ error: 'Fallo Pago PDF' }); }
};
