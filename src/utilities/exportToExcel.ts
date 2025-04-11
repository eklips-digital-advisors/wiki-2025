import * as XLSX from "xlsx";
import { columns } from '@/blocks/SitesBlock/Columns'
export const exportToExcel = (sites: any[]) => {
  // Use all columns
  const allColumns = columns;

  // Extract all fields from data
  const formattedData = sites.map((item: any) => {
    const row: any = {};
    allColumns.forEach((col) => {
      let value = item[col.key] ?? "";

      if (value !== "-" && typeof value !== "string") {
        value = typeof value === "object" ? JSON.stringify(value) : value;
      }

      row[col.label] = value;
    });
    return row;
  });

  // Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Websites");

  // Generate Excel file and download
  XLSX.writeFile(workbook, "eklips-sites-list.xlsx");
};
