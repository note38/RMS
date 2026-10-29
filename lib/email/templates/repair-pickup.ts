import type { SystemRequest } from "@/components/admin/admin-requests/types";

/**
 * Generates the default email subject line.
 */
export function generateRepairPickupDefaultSubject(request: SystemRequest): string {
  const equip =
    request.details["Equipment Type"] ||
    request.details["Brand Name"] ||
    "Equipment";
  return `[Ready for Pickup] Repair Completed - ${equip} (${request.seriesNo})`;
}

/**
 * Generates the default plain-text message for the email modal.
 * Admins can send this directly or edit it before sending.
 */
export function generateRepairPickupDefaultMessage(request: SystemRequest): string {
  const recipientName =
    request.createdBy.name || request.requestedBy || "Valued Requester";
  const equipType = request.details["Equipment Type"] || "Equipment";
  const brand = request.details["Brand Name"] || "";
  const model = request.details["Model Number"] || "";
  const serialNo = request.details["Serial Number"] || "N/A";
  const propertyNo = request.details["Property Number"] || "N/A";
  const office = request.requestingOffice || "N/A";
  const findings =
    request.technicianFindings || request.details["Findings"] || "";
  const recommendation =
    request.technicianRecommendation || request.details["Recommendation"] || "";

  const equipDescription = [brand, model].filter(Boolean).join(" ");

  let msg = `Dear ${recipientName},

Good day!

We are pleased to inform you that your repair request has been completed and your equipment is now ready for pickup.

REQUEST & EQUIPMENT DETAILS:
• Series No: ${request.seriesNo}
• Equipment: ${equipType}${equipDescription ? ` (${equipDescription})` : ""}
• Serial / Property No: ${serialNo} / ${propertyNo}
• Requesting Office: ${office}
`;

  if (findings) {
    msg += `• Technician Findings: ${findings}\n`;
  }
  if (recommendation) {
    msg += `• Recommendation: ${recommendation}\n`;
  }

  msg += `
PICKUP INSTRUCTIONS:
• Location: IT Support / Maintenance Office
• Office Hours: Monday - Thursday, 7:00 AM - 6:00 PM

If you have any questions, please feel free to reply to this message.

Thank you`;
  return msg;
}

/**
 * Converts user text (with line breaks) into an email HTML template.
 */
export function formatPickupHtmlEmail({
  subject,
  message,
  seriesNo,
}: {
  subject: string;
  message: string;
  seriesNo: string;
}): string {
  // Convert newlines to HTML paragraphs/breaks
  const formattedBody = message
    .split("\n\n")
    .map((paragraph) => {
      const lines = paragraph.split("\n");
      // Check if it's bullet list lines
      const isBulletBlock = lines.every((line) => line.trim().startsWith("•") || line.trim().startsWith("-"));
      if (isBulletBlock && lines.length > 0) {
        const listItems = lines
          .map((line) => `<li style="margin-bottom: 6px;">${escapeHtml(line.replace(/^[•-]\s*/, ""))}</li>`)
          .join("");
        return `<ul style="margin: 12px 0 16px 20px; padding: 0; color: #374151;">${listItems}</ul>`;
      }
      return `<p style="margin: 0 0 14px 0; line-height: 1.6; color: #374151;">${lines
        .map(escapeHtml)
        .join("<br/>")}</p>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 24px 28px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">
                Request Management System
              </h1>
              <p style="margin: 4px 0 0 0; color: #bfdbfe; font-size: 13px;">
                Repair Completed & Ready for Pickup • Ref: <span style="font-family: monospace; font-weight: 600; color: #ffffff;">${escapeHtml(seriesNo)}</span>
              </p>
            </td>
          </tr>

          <!-- Notification Banner -->
          <tr>
            <td style="background-color: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 12px 28px;">
              <p style="margin: 0; color: #065f46; font-size: 13px; font-weight: 600; display: flex; align-items: center;">
                ✓ Good news! Your repair request has been marked as finished.
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 28px 20px 28px; font-size: 14px;">
              ${formattedBody}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 28px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This is an automated notification from the Request Management System (RMS).
              </p>
              <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 11px;">
                Please do not share confidential credentials. Contact your office administrator for assistance.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
