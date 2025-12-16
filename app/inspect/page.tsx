"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { parseHL7, validateMDM, ParsedHL7 } from "@/lib/hl7Parser";
import { sampleMDMMessage } from "@/lib/sampleMDM";
import RawView from "@/components/RawView";
import TreeView from "@/components/TreeView";
import TableView from "@/components/TableView";

type ViewMode = "raw" | "tree" | "table";

export default function InspectPage() {
  const [message, setMessage] = useState("");
  const [parsed, setParsed] = useState<ParsedHL7 | null>(null);
  const [messageType, setMessageType] = useState<string | undefined>();
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("raw");
  const [parseError, setParseError] = useState<string | null>(null);

  // Load message from localStorage if coming from create page
  useEffect(() => {
    const storedMessage = localStorage.getItem("hl7MessageToInspect");
    if (storedMessage) {
      setMessage(storedMessage);
      localStorage.removeItem("hl7MessageToInspect");
      // Auto-parse the message
      setTimeout(() => {
        const result = parseHL7(storedMessage);
        if (result.success && result.data) {
          setParsed(result.data);
          setMessageType(result.messageType);
          setParseError(null);
          if (result.messageType?.startsWith("MDM")) {
            const validation = validateMDM(result.data);
            setErrors(validation.errors);
            setWarnings(validation.warnings);
          } else {
            setErrors([]);
            setWarnings(result.warnings || []);
          }
        }
      }, 100);
    }
  }, []);

  const handleParse = () => {
    if (!message.trim()) {
      setParseError("Please enter an HL7 message");
      return;
    }

    const result = parseHL7(message);
    
    if (result.success && result.data) {
      setParsed(result.data);
      setMessageType(result.messageType);
      setParseError(null);
      
      // Validate if it's an MDM message
      if (result.messageType?.startsWith("MDM")) {
        const validation = validateMDM(result.data);
        setErrors(validation.errors);
        setWarnings(validation.warnings);
      } else {
        setErrors([]);
        setWarnings(result.warnings || []);
      }
    } else {
      setParsed(null);
      setParseError(result.error || "Failed to parse message");
      setErrors([]);
      setWarnings([]);
    }
  };

  const loadSample = () => {
    setMessage(sampleMDMMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
            Inspect HL7 Message
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paste HL7 Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="MSH|^~\\&|..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleParse}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Parse Message
            </button>
            <button
              onClick={loadSample}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Load Sample MDM
            </button>
          </div>
        </div>

        {parseError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 font-medium">Error:</p>
            <p className="text-red-600 dark:text-red-300">{parseError}</p>
          </div>
        )}

        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 font-medium mb-2">
              Validation Errors:
            </p>
            <ul className="list-disc list-inside text-red-600 dark:text-red-300">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
              Warnings:
            </p>
            <ul className="list-disc list-inside text-yellow-600 dark:text-yellow-300">
              {warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {parsed && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Parsed Message
                  </h2>
                  {messageType && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Message Type: <span className="font-mono">{messageType}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("raw")}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      viewMode === "raw"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Raw
                  </button>
                  <button
                    onClick={() => setViewMode("tree")}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      viewMode === "tree"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Tree
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      viewMode === "table"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                {viewMode === "raw" && <RawView message={message} parsed={parsed} />}
                {viewMode === "tree" && <TreeView parsed={parsed} />}
                {viewMode === "table" && <TableView parsed={parsed} />}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

