/**
 * HL7 Parser Module
 * Parses pipe-delimited HL7 v2.x messages into structured JSON
 */

export interface HL7Field {
  [componentIndex: string]: string;
}

export interface HL7Segment {
  [fieldIndex: string]: HL7Field | string | (HL7Field | string)[];
}

export interface ParsedHL7 {
  [segmentName: string]: HL7Segment | HL7Segment[];
}

export interface ParseResult {
  success: boolean;
  data?: ParsedHL7;
  messageType?: string;
  error?: string;
  warnings?: string[];
}

/**
 * Parse an HL7 message string into structured JSON
 */
export function parseHL7(message: string): ParseResult {
  const warnings: string[] = [];
  
  if (!message || message.trim().length === 0) {
    return {
      success: false,
      error: "Message is empty",
    };
  }

  // Normalize line endings and split into segments
  const segments = message
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (segments.length === 0) {
    return {
      success: false,
      error: "No segments found in message",
    };
  }

  // Parse MSH segment first to get field separator and encoding characters
  const mshSegment = segments[0];
  if (!mshSegment.startsWith("MSH")) {
    return {
      success: false,
      error: "Message must start with MSH segment",
    };
  }

  // MSH-1 is the field separator (usually |)
  // MSH-2 contains encoding characters (usually ^~\&)
  const fieldSeparator = mshSegment[3] || "|";
  const encodingChars = mshSegment.length > 4 ? mshSegment.substring(4, 8) : "^~\\&";
  const componentSeparator = encodingChars[0] || "^";
  const repetitionSeparator = encodingChars[1] || "~";
  const escapeChar = encodingChars[2] || "\\";
  const subComponentSeparator = encodingChars[3] || "&";

  const parsed: ParsedHL7 = {};

  // Parse each segment
  for (const segmentStr of segments) {
    if (segmentStr.length < 4) {
      warnings.push(`Skipping invalid segment: ${segmentStr}`);
      continue;
    }

    const segmentName = segmentStr.substring(0, 3);
    const fields = segmentStr.split(fieldSeparator);

    // Skip the segment name (field 0) and start from field 1
    const segmentData: HL7Segment = {};

    for (let i = 1; i < fields.length; i++) {
      const fieldValue = fields[i];
      
      // Handle repetition separator (~)
      if (fieldValue.includes(repetitionSeparator)) {
        const repetitions = fieldValue.split(repetitionSeparator);
        segmentData[i.toString()] = repetitions.map((rep) => parseField(rep, componentSeparator, subComponentSeparator));
      } else {
        segmentData[i.toString()] = parseField(fieldValue, componentSeparator, subComponentSeparator);
      }
    }

    // Handle repeating segments (e.g., multiple OBX segments)
    if (parsed[segmentName]) {
      if (Array.isArray(parsed[segmentName])) {
        (parsed[segmentName] as HL7Segment[]).push(segmentData);
      } else {
        parsed[segmentName] = [parsed[segmentName] as HL7Segment, segmentData];
      }
    } else {
      parsed[segmentName] = segmentData;
    }
  }

  // Extract message type from MSH-9
  let messageType: string | undefined;
  if (parsed.MSH && typeof parsed.MSH === "object" && !Array.isArray(parsed.MSH)) {
    const msh9 = parsed.MSH["9"];
    if (msh9 && typeof msh9 === "object" && !Array.isArray(msh9)) {
      const msgCode = msh9["1"] || "";
      const triggerEvent = msh9["2"] || "";
      messageType = msgCode && triggerEvent ? `${msgCode}^${triggerEvent}` : msgCode || "Unknown";
    }
  }

  return {
    success: true,
    data: parsed,
    messageType,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Parse a field value into components and sub-components
 */
function parseField(
  fieldValue: string,
  componentSeparator: string,
  subComponentSeparator: string
): HL7Field | string {
  if (!fieldValue || fieldValue.length === 0) {
    return "";
  }

  // Check if field contains components
  if (fieldValue.includes(componentSeparator)) {
    const components = fieldValue.split(componentSeparator);
    const field: HL7Field = {};
    
    components.forEach((comp, index) => {
      const compIndex = (index + 1).toString();
      
      // Check if component contains sub-components
      if (comp.includes(subComponentSeparator)) {
        const subComponents = comp.split(subComponentSeparator);
        field[compIndex] = subComponents.join(subComponentSeparator);
      } else {
        field[compIndex] = comp;
      }
    });
    
    return field;
  }

  return fieldValue;
}

/**
 * Validate MDM message structure
 */
export function validateMDM(parsed: ParsedHL7): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required segments
  if (!parsed.MSH) {
    errors.push("Missing required segment: MSH");
  }

  if (!parsed.PID) {
    errors.push("Missing required segment: PID");
  }

  if (!parsed.TXA) {
    errors.push("Missing required segment: TXA");
  }

  // Validate MSH segment
  if (parsed.MSH && typeof parsed.MSH === "object" && !Array.isArray(parsed.MSH)) {
    if (!parsed.MSH["9"]) {
      errors.push("MSH-9 (Message Type) is required");
    } else {
      const msh9 = parsed.MSH["9"];
      if (typeof msh9 === "object" && !Array.isArray(msh9)) {
        const msgCode = msh9["1"];
        const triggerEvent = msh9["2"];
        if (msgCode !== "MDM") {
          warnings.push(`Expected message type MDM, found: ${msgCode}`);
        }
        if (triggerEvent !== "T02") {
          warnings.push(`Expected trigger event T02, found: ${triggerEvent}`);
        }
      }
    }
  }

  // Validate PID segment
  if (parsed.PID && typeof parsed.PID === "object" && !Array.isArray(parsed.PID)) {
    const pid3 = parsed.PID["3"];
    if (!pid3 || (typeof pid3 === "object" && !Array.isArray(pid3) && !pid3["1"])) {
      warnings.push("PID-3 (Patient Identifier List) is recommended");
    }
  }

  // Validate TXA segment
  if (parsed.TXA && typeof parsed.TXA === "object" && !Array.isArray(parsed.TXA)) {
    if (!parsed.TXA["2"]) {
      warnings.push("TXA-2 (Document Type) is recommended");
    }
    if (!parsed.TXA["4"]) {
      warnings.push("TXA-4 (Activity Date/Time) is recommended");
    }
    if (!parsed.TXA["12"]) {
      warnings.push("TXA-12 (Completion Status) is recommended");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

