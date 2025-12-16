/**
 * HL7 Generator Module
 * Converts structured JSON to HL7 v2.x pipe-delimited format
 */

import { ParsedHL7, HL7Segment, HL7Field } from "./hl7Parser";

export interface MDMMessageData {
  msh: {
    sendingApplication?: string;
    sendingFacility?: string;
    receivingApplication?: string;
    receivingFacility?: string;
    messageControlId?: string;
    processingId?: string;
    versionId?: string;
  };
  pid: {
    patientId?: string;
    patientIdList?: string;
    patientName?: string;
    dateOfBirth?: string;
    sex?: string;
    address?: string;
  };
  txa: {
    documentType?: string;
    contentPresentation?: string;
    activityDateTime?: string;
    primaryActivityProvider?: string;
    completionStatus?: string;
    uniqueDocumentNumber?: string;
  };
  pv1?: {
    patientClass?: string;
    assignedPatientLocation?: string;
  };
  obx?: Array<{
    setId?: string;
    valueType?: string;
    observationIdentifier?: string;
    observationValue?: string;
    units?: string;
  }>;
}

/**
 * Generate an HL7 message from structured data
 */
export function generateHL7(data: ParsedHL7): string {
  const fieldSeparator = "|";
  const componentSeparator = "^";
  const repetitionSeparator = "~";
  const escapeChar = "\\";
  const subComponentSeparator = "&";
  const encodingChars = `${componentSeparator}${repetitionSeparator}${escapeChar}${subComponentSeparator}`;

  const segments: string[] = [];

  // Generate segments in order
  const segmentOrder = ["MSH", "PID", "PV1", "TXA", "OBX"];

  for (const segmentName of segmentOrder) {
    const segmentData = data[segmentName];
    if (!segmentData) continue;

    if (Array.isArray(segmentData)) {
      // Handle repeating segments (e.g., multiple OBX)
      for (const seg of segmentData) {
        segments.push(buildSegment(segmentName, seg, fieldSeparator, componentSeparator));
      }
    } else {
      segments.push(buildSegment(segmentName, segmentData, fieldSeparator, componentSeparator));
    }
  }

  return segments.join("\r");
}

/**
 * Build a single segment string
 */
function buildSegment(
  segmentName: string,
  segmentData: HL7Segment,
  fieldSeparator: string,
  componentSeparator: string
): string {
  const fields: string[] = [segmentName];

  // Get all field indices and sort them
  const fieldIndices = Object.keys(segmentData)
    .map((k) => parseInt(k, 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  let currentIndex = 1;
  for (const fieldIndex of fieldIndices) {
    // Fill in empty fields between current and fieldIndex
    while (currentIndex < fieldIndex) {
      fields.push("");
      currentIndex++;
    }

    const fieldValue = segmentData[fieldIndex.toString()];
    if (fieldValue) {
      if (Array.isArray(fieldValue)) {
        // Handle repetitions - join with repetition separator
        const repetitionSeparator = "~";
        fields.push(
          fieldValue
            .map((rep) => formatFieldValue(rep, componentSeparator))
            .join(repetitionSeparator)
        );
      } else {
        fields.push(formatFieldValue(fieldValue, componentSeparator));
      }
    } else {
      fields.push("");
    }
    currentIndex++;
  }

  return fields.join(fieldSeparator);
}

/**
 * Format a field value (handles components and sub-components)
 */
function formatFieldValue(fieldValue: HL7Field | string, componentSeparator: string): string {
  if (typeof fieldValue === "string") {
    return fieldValue;
  }

  // Handle field with components
  const componentIndices = Object.keys(fieldValue)
    .map((k) => parseInt(k, 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  const components: string[] = [];
  let currentCompIndex = 1;

  for (const compIndex of componentIndices) {
    // Fill in empty components
    while (currentCompIndex < compIndex) {
      components.push("");
      currentCompIndex++;
    }

    const compValue = fieldValue[compIndex.toString()];
    components.push(typeof compValue === "string" ? compValue : "");
    currentCompIndex++;
  }

  return components.join(componentSeparator);
}

/**
 * Generate MDM^T02 message from form data
 */
export function generateMDM(data: MDMMessageData): string {
  const now = new Date();
  const timestamp = formatHL7DateTime(now);
  const messageControlId = data.msh.messageControlId || generateMessageControlId();

  const parsed: ParsedHL7 = {
    MSH: {
      "1": "|",
      "2": "^~\\&",
      "3": data.msh.sendingApplication || "",
      "4": data.msh.sendingFacility || "",
      "5": data.msh.receivingApplication || "",
      "6": data.msh.receivingFacility || "",
      "7": { "1": timestamp },
      "9": { "1": "MDM", "2": "T02" },
      "10": messageControlId,
      "11": data.msh.processingId || "P",
      "12": { "1": data.msh.versionId || "2.5" },
    },
    PID: {
      "3": data.pid.patientIdList
        ? { "1": data.pid.patientIdList }
        : data.pid.patientId
        ? { "1": data.pid.patientId }
        : "",
      "5": data.pid.patientName ? { "1": data.pid.patientName } : "",
      "7": data.pid.dateOfBirth || "",
      "8": data.pid.sex || "",
      "11": data.pid.address ? { "1": data.pid.address } : "",
    },
    TXA: {
      "2": data.txa.documentType || "",
      "3": data.txa.contentPresentation || "",
      "4": data.txa.activityDateTime || timestamp,
      "5": data.txa.primaryActivityProvider
        ? { "1": data.txa.primaryActivityProvider }
        : "",
      "12": data.txa.completionStatus || "",
      "16": data.txa.uniqueDocumentNumber || "",
    },
  };

  // Add optional PV1 segment
  if (data.pv1) {
    parsed.PV1 = {
      "2": data.pv1.patientClass || "",
      "3": data.pv1.assignedPatientLocation ? { "1": data.pv1.assignedPatientLocation } : "",
    };
  }

  // Add optional OBX segments
  if (data.obx && data.obx.length > 0) {
    parsed.OBX = data.obx.map((obx) => ({
      "1": obx.setId || "",
      "2": obx.valueType || "",
      "3": obx.observationIdentifier ? { "1": obx.observationIdentifier } : "",
      "5": obx.observationValue || "",
      "6": obx.units ? { "1": obx.units } : "",
    }));
  }

  return generateHL7(parsed);
}

/**
 * Format date/time in HL7 format (YYYYMMDDHHMMSS)
 */
function formatHL7DateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Generate a unique message control ID
 */
function generateMessageControlId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `MSG${timestamp}${random}`;
}

