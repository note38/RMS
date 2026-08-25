import { RepairPrintLayout } from "./layouts/RepairPrintLayout";
import { CctvPrintLayout } from "./layouts/CctvPrintLayout";
import { InstallationPrintLayout } from "./layouts/InstallationPrintLayout";
import type { RequestPrintItem } from "./types";

interface PrintableSheetProps {
  item: RequestPrintItem;
  copyLabel?: string;
}

export function PrintableSheet({ item, copyLabel }: PrintableSheetProps) {
  switch (item.category) {
    case "Repair":
      return <RepairPrintLayout item={item} copyLabel={copyLabel} />;
    case "CCTV":
      return <CctvPrintLayout item={item} copyLabel={copyLabel} />;
    case "Internet":
      return <InstallationPrintLayout item={item} copyLabel={copyLabel} />;
    default:
      return <RepairPrintLayout item={item} copyLabel={copyLabel} />;
  }
}
