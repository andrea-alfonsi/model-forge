import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
type RowData = Record<string, any>; 

const MAX_ROWS = 5;
const MAX_COLS = 10;

export function TabularFilePreview(props: { onChange?: (data: { file: File, data: RowData[], headers: string[] }) => void}) {
  const [data, setData] = useState<RowData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [_, setFile] = useState<File | null>(null);


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;


    setData([]);
    setFile( uploadedFile)
    setHeaders([]);
    setError(null);

    // Only allow CSV and Excel extensions
    const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv' && fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        setError("Unsupported file type. Please upload a CSV, XLSX, or XLS file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get the first sheet name
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert the sheet data to JSON
        // `header: 1` means the first row is used as headers/keys
        const json: RowData[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (json.length === 0) {
            setError("The file is empty or could not be parsed.");
            return;
        }

        // --- Data Extraction and Limiting ---
        const [headerRow, ...dataRows] = json;
        
        // 1. Determine Headers: Filter and limit to MAX_COLS
        const allHeaders = (headerRow as string[]).map(h => String(h || ''));
        const limitedHeaders = allHeaders.slice(0, MAX_COLS);
        setHeaders(limitedHeaders);

        // 2. Determine Data: Limit to MAX_ROWS and only include limited columns
        const limitedData = dataRows.slice(0, MAX_ROWS).map((row) => {
          const rowObject: RowData = {};
          
          // Map each cell in the row to the corresponding header
          limitedHeaders.forEach((header, index) => {
            // Use the header text as the key for the row object
            const cellValue = row[index];
            rowObject[header] = cellValue !== undefined ? String(cellValue) : '';
          });
          
          return rowObject;
        });

        setData(limitedData);
        setError(null);
        props.onChange?.({
          file: uploadedFile,
          data: limitedData,
          headers: limitedHeaders
        });

      } catch (e) {
        console.error("Error parsing file:", e);
        setError("An error occurred during file parsing. Please check the file format.");
      }
    };

    // Read the file as an ArrayBuffer, which works for both CSV and XLSX
    reader.readAsArrayBuffer(uploadedFile);
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV or Excel File (.csv, .xlsx, .xls)
        </label>
        <Input 
          id="file-upload"
          type="file" 
          accept=".csv, .xlsx, .xls" 
          onChange={handleFileUpload} 
        />
      </div>

      {error && (
        <div className="text-red-500 font-medium p-3 border border-red-300 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {data.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index} className="font-bold bg-gray-50">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((headerKey, cellIndex) => (
                    <TableCell key={cellIndex} className='text-center'>
                      {row[headerKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}