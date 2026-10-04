// Helpers de estilo ExcelJS compartidos entre IngresosView y RequerimientosView.
// Antes vivían duplicados casi al byte en cada vista (addTitleBlock/xlTitleBlock,
// styleHeaderRow/xlStyleHeader, styleDataRow/xlStyleDataRow, formatDate/xlFormatDate).

export const MP_EXCEL_COLORS = {
    headerBg: 'FF1B3A5C',
    headerFont: 'FFFFFFFF',
    titleBg: 'FF0D47A1',
    subtitleFont: 'FF5A6A7E',
    altRow: 'FFF2F7FC',
    totalBg: 'FF2D3748',
    totalFont: 'FFFFFFFF',
    green: 'FF16A34A',
    blue: 'FF2563EB',
    red: 'FFDC2626',
    borderColor: 'FFD1D5DB'
};

export function crearBordeFino(colors = MP_EXCEL_COLORS) {
    return {
        top: { style: 'thin', color: { argb: colors.borderColor } },
        left: { style: 'thin', color: { argb: colors.borderColor } },
        bottom: { style: 'thin', color: { argb: colors.borderColor } },
        right: { style: 'thin', color: { argb: colors.borderColor } }
    };
}

/** Filas 1-4: título "MADERA POLTAND", subtítulo, fecha de generación y separador. */
export function agregarBloqueTitulo(ws, subtitulo, totalCols, colors = MP_EXCEL_COLORS) {
    const hoy = new Date();
    const fechaStr = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
    const lastCol = String.fromCharCode(64 + Math.min(totalCols, 26));

    ws.mergeCells(`A1:${lastCol}1`);
    const r1 = ws.getCell('A1');
    r1.value = 'MADERA POLTAND';
    r1.font = { name: 'Calibri', size: 16, bold: true, color: { argb: colors.titleBg } };
    r1.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 30;

    ws.mergeCells(`A2:${lastCol}2`);
    const r2 = ws.getCell('A2');
    r2.value = subtitulo;
    r2.font = { name: 'Calibri', size: 12, color: { argb: colors.subtitleFont } };
    r2.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 22;

    ws.mergeCells(`A3:${lastCol}3`);
    const r3 = ws.getCell('A3');
    r3.value = `Generado: ${fechaStr}`;
    r3.font = { name: 'Calibri', size: 10, italic: true, color: { argb: colors.subtitleFont } };
    r3.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(3).height = 18;

    ws.getRow(4).height = 8;
}

export function estilizarFilaCabecera(ws, rowNum, totalCols, colors = MP_EXCEL_COLORS) {
    const borde = crearBordeFino(colors);
    const row = ws.getRow(rowNum);
    row.height = 28;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= totalCols) {
            cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: colors.headerFont } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.headerBg } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = borde;
        }
    });
}

export function estilizarFilaDatos(ws, rowNum, totalCols, isAlt, colors = MP_EXCEL_COLORS) {
    const borde = crearBordeFino(colors);
    const row = ws.getRow(rowNum);
    row.height = 20;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= totalCols) {
            cell.font = cell.font || { name: 'Calibri', size: 10 };
            cell.border = borde;
            if (isAlt) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.altRow } };
            }
        }
    });
}

/** Fecha para nombre de archivo, ej. "03-10-2026". */
export function formatearFechaArchivo(fecha = new Date()) {
    return `${String(fecha.getDate()).padStart(2, '0')}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${fecha.getFullYear()}`;
}
