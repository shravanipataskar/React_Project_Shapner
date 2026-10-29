export async function downloadPdf(filename, title, headers, rows) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const document = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  })
  const pageWidth = document.internal.pageSize.getWidth()

  document.setFontSize(18)
  document.text(title, 40, 42)
  document.setFontSize(9)
  document.text(
    `Generated ${new Date().toLocaleDateString()}`,
    pageWidth - 40,
    42,
    { align: 'right' },
  )

  autoTable(document, {
    startY: 62,
    head: [headers],
    body: rows.length
      ? rows
      : [['No records available', ...headers.slice(1).map(() => '')]],
    margin: { left: 40, right: 40 },
    styles: {
      fontSize: 9,
      cellPadding: 6,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [35, 35, 35],
      textColor: [255, 214, 0],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didParseCell(data) {
      if (
        rows.length === 0 &&
        data.section === 'body' &&
        data.column.index === 0
      ) {
        data.cell.colSpan = headers.length
        data.cell.styles.halign = 'center'
        data.cell.styles.textColor = [85, 85, 85]
      }
    },
  })

  const blob = document.output('blob')
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = filename
  window.document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
