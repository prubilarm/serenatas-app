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

    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=comprobante-${s.id}.pdf`);
    doc.pipe(res);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    // ─── FONDO GENERAL ───────────────────────────
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FAFAF8');

    // ─── HEADER NEGRO ────────────────────────────
    doc.rect(0, 0, pageWidth, 160).fill('#0D0D0D');
    // Franja dorada inferior del header
    doc.rect(0, 160, pageWidth, 4).fill('#D4AF37');
    // Líneas decorativas finas en el header
    doc.rect(margin, 22, contentWidth, 0.5).fill('#D4AF3740');
    doc.rect(margin, 148, contentWidth, 0.5).fill('#D4AF3740');

    // Nombre principal
    doc
      .font('Helvetica-Bold')
      .fontSize(28)
      .fillColor('#D4AF37')
      .text('EL MARIACHI AVENTURERO', 0, 38, {
        align: 'center',
        characterSpacing: 3,
        width: pageWidth,
      });

    // Subtítulo musical
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#AAAAAA')
      .text('\u266A  SERENATAS CON ESTILO  \u266A', 0, 78, {
        align: 'center',
        characterSpacing: 5,
        width: pageWidth,
      });

    // Título del documento
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#FFFFFF')
      .text('COMPROBANTE DE RESERVA', 0, 110, {
        align: 'center',
        characterSpacing: 4,
        width: pageWidth,
      });

    // Folio
    const folio = s.id.substring(0, 8).toUpperCase();
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#888888')
      .text(`N\u00B0 ${folio}`, 0, 132, {
        align: 'center',
        characterSpacing: 2,
        width: pageWidth,
      });

    // ─── BADGE DE ESTADO ─────────────────────────
    const estadoColor = s.estado === 'completada' ? '#27AE60' : '#D4AF37';
    const estadoText = s.estado === 'completada' ? 'COMPLETADA' : 'CONFIRMADA';
    const badgeW = 120;
    const badgeX = (pageWidth - badgeW) / 2;
    doc.roundedRect(badgeX, 176, badgeW, 26, 13).fill(estadoColor);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#FFFFFF')
      .text(estadoText, badgeX, 184, {
        align: 'center',
        width: badgeW,
        characterSpacing: 2,
      });

    // ─── HELPERS ─────────────────────────────────
    let yPos = 222;

    const drawSectionTitle = (title: string, y: number): number => {
      doc.rect(margin, y + 5, 3, 14).fill('#D4AF37');
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#1A1A1A')
        .text(title, margin + 10, y, { characterSpacing: 1.5, width: contentWidth });
      doc.rect(margin, y + 22, contentWidth, 0.7).fill('#E0E0E0');
      return y + 32;
    };

    const drawField = (label: string, value: string, x: number, y: number, colWidth: number): void => {
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#888888')
        .text(label.toUpperCase(), x, y, { characterSpacing: 0.8, width: colWidth });
      doc
        .font('Helvetica-Bold')
        .fontSize(11.5)
        .fillColor('#1A1A1A')
        .text(value || '\u2014', x, y + 12, { width: colWidth });
    };

    const col1X = margin;
    const col2X = margin + contentWidth / 2 + 10;
    const colW = contentWidth / 2 - 10;

    // ─── SECCIÓN CLIENTE ────────────────────────
    yPos = drawSectionTitle('INFORMACI\u00D3N DEL CLIENTE', yPos);
    drawField('Cliente que contrata', s.nombre_cliente || 'N/A', col1X, yPos, colW);
    drawField('Tel\u00E9fono de contacto', s.telefono || 'N/A', col2X, yPos, colW);
    yPos += 44;

    // ─── SECCIÓN EVENTO ─────────────────────────
    yPos = drawSectionTitle('DETALLES DEL EVENTO', yPos);
    drawField('Serenata para', s.nombre_festejada, col1X, yPos, colW);
    drawField('Motivo de celebraci\u00F3n', s.motivo || 'Presentaci\u00F3n especial', col2X, yPos, colW);
    yPos += 44;

    const fechaFormateada = (() => {
      if (!s.fecha) return '\u2014';
      const [year, month, day] = s.fecha.split('-');
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      return `${day} de ${meses[parseInt(month) - 1]} de ${year}`;
    })();

    drawField('Fecha del evento', fechaFormateada, col1X, yPos, colW);
    drawField('Hora estimada', s.hora || 'Por confirmar', col2X, yPos, colW);
    yPos += 44;

    // Dirección (ancho completo)
    doc.font('Helvetica').fontSize(8).fillColor('#888888')
      .text('DIRECCI\u00D3N DEL EVENTO', col1X, yPos, { characterSpacing: 0.8 });
    doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#1A1A1A')
      .text(`${s.direccion || '\u2014'}${s.comuna ? ', ' + s.comuna : ''}`, col1X, yPos + 12, { width: contentWidth });
    yPos += 44;

    const tipoLabel = s.tipo === 'full'
      ? 'Serenata Completa \u2014 4 canciones'
      : 'Serenata Express \u2014 2 canciones';
    drawField('Tipo de servicio', tipoLabel, col1X, yPos, contentWidth);
    yPos += 44;

    // ─── SECCIÓN REPERTORIO ─────────────────────
    yPos = drawSectionTitle('REPERTORIO ELEGIDO', yPos);

    if (s.canciones && s.canciones.length > 0) {
      const sorted = [...s.canciones].sort((a: string, b: string) => a.localeCompare(b));
      const perCol = Math.ceil(sorted.length / 2);
      const col1Songs = sorted.slice(0, perCol);
      const col2Songs = sorted.slice(perCol);
      const startY = yPos;
      col1Songs.forEach((c: string, i: number) => {
        doc.font('Helvetica').fontSize(10).fillColor('#333333')
          .text(`${i + 1}.  ${c}`, col1X, yPos + i * 18, { width: colW });
      });
      col2Songs.forEach((c: string, i: number) => {
        doc.font('Helvetica').fontSize(10).fillColor('#333333')
          .text(`${perCol + i + 1}.  ${c}`, col2X, startY + i * 18, { width: colW });
      });
      yPos += Math.max(col1Songs.length, col2Songs.length) * 18 + 14;
    } else {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#AAAAAA')
        .text('Sin canciones seleccionadas \u2014 repertorio a elecci\u00F3n en el momento',
          col1X, yPos, { align: 'center', width: contentWidth });
      yPos += 24;
    }

    yPos += 14;

    // ─── CAJA DE PRECIO PREMIUM ──────────────────
    const boxH = 72;
    // Sombra
    doc.rect(margin + 3, yPos + 3, contentWidth, boxH).fill('#D4AF3720');
    // Fondo
    doc.rect(margin, yPos, contentWidth, boxH).fill('#0D0D0D');
    // Borde dorado
    doc.rect(margin, yPos, contentWidth, boxH).lineWidth(1.5).stroke('#D4AF37');
    // Línea interna decorativa
    doc.rect(margin + 10, yPos + 8, contentWidth - 20, 0.5).fill('#D4AF3650');

    doc.font('Helvetica').fontSize(8).fillColor('#AAAAAA')
      .text('VALOR TOTAL DEL SERVICIO', 0, yPos + 14, {
        align: 'center', characterSpacing: 3, width: pageWidth,
      });

    const precioFormateado = `$${(s.precio_total || 0).toLocaleString('es-CL')}`;
    doc.font('Helvetica-Bold').fontSize(30).fillColor('#D4AF37')
      .text(precioFormateado, 0, yPos + 28, { align: 'center', width: pageWidth });

    // ─── PIE DE PÁGINA ───────────────────────────
    const footerY = pageHeight - 80;
    doc.rect(0, footerY - 8, pageWidth, 0.7).fill('#D4AF37');

    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0D0D0D')
      .text('EL MARIACHI AVENTURERO', 0, footerY + 6, {
        align: 'center', characterSpacing: 2, width: pageWidth,
      });

    doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#666666')
      .text('\u00A1Gracias por elegirnos! Haremos de este momento algo inolvidable.', 0, footerY + 22, {
        align: 'center', width: pageWidth,
      });

    doc.font('Helvetica').fontSize(7.5).fillColor('#AAAAAA')
      .text(
        `Comprobante generado el ${new Date().toLocaleDateString('es-CL')} \u00B7 Folio N\u00B0 ${folio}`,
        0, footerY + 40,
        { align: 'center', width: pageWidth }
      );

    doc.end();
  } catch (error: any) {
    res.status(500).json({ error: 'Error al generar el comprobante' });
  }
};
