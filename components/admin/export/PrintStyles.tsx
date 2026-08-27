/**
 * Print-only CSS for the request export sheet.
 * Kept in its own component so PrintableRequestModal doesn't have to carry
 * a raw <style dangerouslySetInnerHTML> block inline.
 */
interface PrintStylesProps {
  category?: string;
}

export function PrintStyles({ category }: PrintStylesProps) {
  const isLandscape = ["CCTV", "Internet"].includes(category ?? "");

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: ${isLandscape ? "landscape" : "portrait"};
            margin: 8mm;
          }

          /* Reset root background & force clean container flow */
          html, body {
            background: white !important;
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          /* Strip all background UI elements outside printable-sheet from print pagination flow */
          body *:not(:has(.printable-sheet)):not(.printable-sheet):not(.printable-sheet *) {
            display: none !important;
          }

          /* Reset all container wrappers leading down to printable-sheet */
          html, body, body *:has(.printable-sheet) {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: transparent !important;
            background-color: transparent !important;
            min-height: 0 !important;
            height: auto !important;
            box-shadow: none !important;
          }

          /* Display printable-sheet as full width clean block */
          .printable-sheet, .printable-sheet * {
            visibility: visible !important;
          }
          .printable-sheet {
            position: relative !important;
            display: block !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 2mm !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            background: white !important;
            background-color: white !important;
          }

          .print\\:hidden,
          .print\\:hidden * {
            display: none !important;
          }

          /* Each Repair copy occupies its own full page */
          .repair-dual-container {
            display: block !important;
            width: 100% !important;
          }
          .repair-copy-item {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .repair-copy-item:first-child {
            break-after: page !important;
            page-break-after: always !important;
          }
          .repair-second-copy {
            break-before: page !important;
            page-break-before: always !important;
            padding-top: 4mm !important;
          }

          /* Two copies side-by-side for CCTV/Internet */
          .print-columns {
            display: flex !important;
            flex-direction: row !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .print-columns > .copy:first-child {
            width: 50% !important;
            box-sizing: border-box !important;
            padding-right: 1.5rem !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-columns > .copy:last-child {
            width: 50% !important;
            box-sizing: border-box !important;
            padding-left: 1.5rem !important;
            border-left: 2px dashed #cbd5e1 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Multi-page break fallback if needed */
          .print-page-break {
            break-before: page !important;
            page-break-before: always !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
        }
      `,
      }}
    />
  );
}
