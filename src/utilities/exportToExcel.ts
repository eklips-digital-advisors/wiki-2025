import * as XLSX from "xlsx";
import { columns } from '@/blocks/SitesBlock/Columns'
export const exportToExcel = (sites: any[]) => {
  // Use all columns
  const allColumns = columns;

  // Extract all fields from data
  const formattedData = sites.map((item: any) => {
    const row: any = {};
    allColumns.forEach((col) => {
      console.log('item', item, col.key)
      row[col.label] = item[col.key] !== undefined ? item[col.key] : "-"; // Default to "-" if value is missing
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
