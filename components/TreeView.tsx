"use client";

import { useState } from "react";
import { ParsedHL7, HL7Segment, HL7Field } from "@/lib/hl7Parser";

interface TreeViewProps {
  parsed: ParsedHL7;
}

export default function TreeView({ parsed }: TreeViewProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm">
      <div className="space-y-2">
        {Object.entries(parsed).map(([segmentName, segmentData]) => {
          if (Array.isArray(segmentData)) {
            return segmentData.map((seg, idx) => (
              <SegmentTree
                key={`${segmentName}-${idx}`}
                segmentName={`${segmentName}[${idx}]`}
                segment={seg}
              />
            ));
          } else {
            return (
              <SegmentTree
                key={segmentName}
                segmentName={segmentName}
                segment={segmentData}
              />
            );
          }
        })}
      </div>
    </div>
  );
}

function SegmentTree({
  segmentName,
  segment,
}: {
  segmentName: string;
  segment: HL7Segment;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-left w-full hover:bg-gray-100 dark:hover:bg-gray-800 py-1"
      >
        <span className="text-blue-600 dark:text-blue-400 font-semibold">
          {expanded ? "▼" : "▶"}
        </span>
        <span className="text-blue-600 dark:text-blue-400 font-semibold">
          {segmentName}
        </span>
      </button>
      {expanded && (
        <div className="ml-6 mt-1 space-y-1">
          {Object.entries(segment)
            .sort(([a], [b]) => {
              const numA = parseInt(a, 10);
              const numB = parseInt(b, 10);
              if (isNaN(numA) || isNaN(numB)) return a.localeCompare(b);
              return numA - numB;
            })
            .map(([fieldIndex, fieldValue]) => (
              <FieldTree
                key={fieldIndex}
                fieldIndex={fieldIndex}
                fieldValue={fieldValue}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function FieldTree({
  fieldIndex,
  fieldValue,
}: {
  fieldIndex: string;
  fieldValue: HL7Field | string | (HL7Field | string)[];
}) {
  const [expanded, setExpanded] = useState(false);

  // Handle repetitions (arrays)
  if (Array.isArray(fieldValue)) {
    return (
      <div className="pl-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-left w-full hover:bg-gray-100 dark:hover:bg-gray-800 py-1"
        >
          <span className="text-green-600 dark:text-green-400">
            {expanded ? "▼" : "▶"}
          </span>
          <span className="text-green-600 dark:text-green-400">
            Field {fieldIndex} (Repetitions: {fieldValue.length})
          </span>
        </button>
        {expanded && (
          <div className="ml-6 mt-1 space-y-1">
            {fieldValue.map((rep, idx) => (
              <div key={idx} className="border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                <div className="text-purple-600 dark:text-purple-400 text-sm mb-1">
                  Repetition {idx + 1}
                </div>
                <FieldTree fieldIndex={`${fieldIndex}[${idx}]`} fieldValue={rep} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof fieldValue === "string") {
    return (
      <div className="pl-4 text-gray-700 dark:text-gray-300">
        <span className="text-green-600 dark:text-green-400">Field {fieldIndex}:</span>{" "}
        <span className="text-gray-900 dark:text-gray-100">
          {fieldValue || <span className="text-gray-400">(empty)</span>}
        </span>
      </div>
    );
  }

  return (
    <div className="pl-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-left w-full hover:bg-gray-100 dark:hover:bg-gray-800 py-1"
      >
        <span className="text-green-600 dark:text-green-400">
          {expanded ? "▼" : "▶"}
        </span>
        <span className="text-green-600 dark:text-green-400">
          Field {fieldIndex}
        </span>
      </button>
      {expanded && (
        <div className="ml-6 mt-1 space-y-1">
          {Object.entries(fieldValue)
            .sort(([a], [b]) => {
              const numA = parseInt(a, 10);
              const numB = parseInt(b, 10);
              if (isNaN(numA) || isNaN(numB)) return a.localeCompare(b);
              return numA - numB;
            })
            .map(([componentIndex, componentValue]) => (
              <div
                key={componentIndex}
                className="pl-4 text-gray-700 dark:text-gray-300"
              >
                <span className="text-orange-600 dark:text-orange-400">
                  Component {componentIndex}:
                </span>{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {componentValue || <span className="text-gray-400">(empty)</span>}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

