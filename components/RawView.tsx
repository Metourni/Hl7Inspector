"use client";

import { ParsedHL7 } from "@/lib/hl7Parser";
import { generateHL7 } from "@/lib/hl7Generator";

interface RawViewProps {
  message: string;
  parsed: ParsedHL7;
}

export default function RawView({ message, parsed }: RawViewProps) {
  // Regenerate HL7 from parsed data to show syntax-highlighted version
  const regenerated = generateHL7(parsed);
  const segments = regenerated.split("\r");

  // Color code segments
  const segmentColors: { [key: string]: string } = {
    MSH: "text-blue-600 dark:text-blue-400",
    PID: "text-green-600 dark:text-green-400",
    PV1: "text-purple-600 dark:text-purple-400",
    TXA: "text-orange-600 dark:text-orange-400",
    OBX: "text-pink-600 dark:text-pink-400",
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
      {segments.map((segment, idx) => {
        const segmentName = segment.substring(0, 3);
        const colorClass = segmentColors[segmentName] || "text-gray-300";
        
        return (
          <div key={idx} className="mb-1">
            <span className={colorClass}>{segmentName}</span>
            <span className="text-yellow-400">|</span>
            <span className="text-gray-300">{segment.substring(4)}</span>
          </div>
        );
      })}
    </div>
  );
}

