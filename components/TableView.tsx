"use client";

import { ParsedHL7, HL7Segment, HL7Field } from "@/lib/hl7Parser";

interface TableViewProps {
  parsed: ParsedHL7;
}

// Field name mappings for common segments
const fieldNames: { [segment: string]: { [field: string]: string } } = {
  MSH: {
    "1": "Field Separator",
    "2": "Encoding Characters",
    "3": "Sending Application",
    "4": "Sending Facility",
    "5": "Receiving Application",
    "6": "Receiving Facility",
    "7": "Date/Time of Message",
    "9": "Message Type",
    "10": "Message Control ID",
    "11": "Processing ID",
    "12": "Version ID",
  },
  PID: {
    "3": "Patient Identifier List",
    "5": "Patient Name",
    "7": "Date/Time of Birth",
    "8": "Administrative Sex",
    "11": "Patient Address",
  },
  PV1: {
    "2": "Patient Class",
    "3": "Assigned Patient Location",
  },
  TXA: {
    "2": "Document Type",
    "3": "Content Presentation",
    "4": "Activity Date/Time",
    "5": "Primary Activity Provider",
    "12": "Completion Status",
    "16": "Unique Document Number",
  },
  OBX: {
    "1": "Set ID",
    "2": "Value Type",
    "3": "Observation Identifier",
    "5": "Observation Value",
    "6": "Units",
  },
};

function getFieldValue(fieldValue: HL7Field | string | (HL7Field | string)[]): string {
  if (Array.isArray(fieldValue)) {
    // Handle repetitions - join with ~
    return fieldValue.map((v) => getFieldValue(v)).join("~");
  }
  if (typeof fieldValue === "string") {
    return fieldValue;
  }
  // For fields with components, show first component or join them
  const components = Object.values(fieldValue).filter((v) => v);
  return components.join("^");
}

export default function TableView({ parsed }: TableViewProps) {
  const rows: Array<{
    segment: string;
    fieldIndex: string;
    fieldName: string;
    value: string;
  }> = [];

  Object.entries(parsed).forEach(([segmentName, segmentData]) => {
    const segments = Array.isArray(segmentData) ? segmentData : [segmentData];
    
    segments.forEach((segment, segIdx) => {
      Object.entries(segment).forEach(([fieldIndex, fieldValue]) => {
        const fieldName =
          fieldNames[segmentName]?.[fieldIndex] || `Field ${fieldIndex}`;
        const value = getFieldValue(fieldValue);
        const displaySegment = Array.isArray(segmentData)
          ? `${segmentName}[${segIdx}]`
          : segmentName;
        
        rows.push({
          segment: displaySegment,
          fieldIndex,
          fieldName,
          value,
        });
      });
    });
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
              Segment
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
              Field Position
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
              Field Name
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-mono text-blue-600 dark:text-blue-400">
                {row.segment}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-mono text-gray-700 dark:text-gray-300">
                {row.fieldIndex}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                {row.fieldName}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                {row.value || <span className="text-gray-400">(empty)</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

