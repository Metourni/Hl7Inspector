"use client";

import { useState } from "react";
import Link from "next/link";
import { generateMDM, MDMMessageData } from "@/lib/hl7Generator";

export default function CreatePage() {
  const [formData, setFormData] = useState<MDMMessageData>({
    msh: {
      sendingApplication: "",
      sendingFacility: "",
      receivingApplication: "",
      receivingFacility: "",
      processingId: "P",
      versionId: "2.5",
    },
    pid: {
      patientId: "",
      patientName: "",
      dateOfBirth: "",
      sex: "",
      address: "",
    },
    txa: {
      documentType: "",
      contentPresentation: "",
      activityDateTime: "",
      primaryActivityProvider: "",
      completionStatus: "",
      uniqueDocumentNumber: "",
    },
  });
  const [includePV1, setIncludePV1] = useState(false);
  const [pv1Data, setPv1Data] = useState({
    patientClass: "",
    assignedPatientLocation: "",
  });
  const [includeOBX, setIncludeOBX] = useState(false);
  const [obxData, setObxData] = useState([
    {
      setId: "1",
      valueType: "TX",
      observationIdentifier: "",
      observationValue: "",
      units: "",
    },
  ]);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // MSH validation
    if (!formData.msh.sendingApplication) {
      newErrors.push("MSH-3 (Sending Application) is required");
    }
    if (!formData.msh.sendingFacility) {
      newErrors.push("MSH-4 (Sending Facility) is required");
    }
    if (!formData.msh.receivingApplication) {
      newErrors.push("MSH-5 (Receiving Application) is required");
    }
    if (!formData.msh.receivingFacility) {
      newErrors.push("MSH-6 (Receiving Facility) is required");
    }

    // PID validation
    if (!formData.pid.patientId && !formData.pid.patientIdList) {
      newErrors.push("PID-3 (Patient ID or Patient ID List) is required");
    }

    // TXA validation
    if (!formData.txa.documentType) {
      newErrors.push("TXA-2 (Document Type) is required");
    }
    if (!formData.txa.completionStatus) {
      newErrors.push("TXA-12 (Completion Status) is required");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleGenerate = () => {
    if (!validateForm()) {
      return;
    }

    const data: MDMMessageData = {
      ...formData,
      pv1: includePV1 ? pv1Data : undefined,
      obx: includeOBX ? obxData : undefined,
    };

    const message = generateMDM(data);
    setGeneratedMessage(message);
  };

  const handleCopy = () => {
    if (generatedMessage) {
      navigator.clipboard.writeText(generatedMessage);
      alert("HL7 message copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (generatedMessage) {
      const blob = new Blob([generatedMessage], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mdm_message_${Date.now()}.hl7`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleInspect = () => {
    if (generatedMessage) {
      // Navigate to inspect page with message in query param or localStorage
      localStorage.setItem("hl7MessageToInspect", generatedMessage);
      window.location.href = "/inspect";
    }
  };

  const addOBX = () => {
    setObxData([
      ...obxData,
      {
        setId: String(obxData.length + 1),
        valueType: "TX",
        observationIdentifier: "",
        observationValue: "",
        units: "",
      },
    ]);
  };

  const removeOBX = (index: number) => {
    setObxData(obxData.filter((_, i) => i !== index));
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
            Create MDM^T02 Message
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Fill in the form below to generate an HL7 MDM^T02 message
          </p>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 font-medium mb-2">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside text-red-600 dark:text-red-300">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            {/* MSH Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                MSH - Message Header
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sending Application (MSH-3) *
                  </label>
                  <input
                    type="text"
                    value={formData.msh.sendingApplication}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        msh: { ...formData.msh, sendingApplication: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="SendingApp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sending Facility (MSH-4) *
                  </label>
                  <input
                    type="text"
                    value={formData.msh.sendingFacility}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        msh: { ...formData.msh, sendingFacility: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="SendingFac"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Receiving Application (MSH-5) *
                  </label>
                  <input
                    type="text"
                    value={formData.msh.receivingApplication}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        msh: { ...formData.msh, receivingApplication: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ReceivingApp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Receiving Facility (MSH-6) *
                  </label>
                  <input
                    type="text"
                    value={formData.msh.receivingFacility}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        msh: { ...formData.msh, receivingFacility: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ReceivingFac"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Processing ID (MSH-11)
                  </label>
                    <input
                      type="text"
                      value={formData.msh.processingId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          msh: { ...formData.msh, processingId: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="P"
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Version ID (MSH-12)
                  </label>
                  <input
                    type="text"
                    value={formData.msh.versionId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        msh: { ...formData.msh, versionId: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="2.5"
                  />
                </div>
              </div>
            </div>

            {/* PID Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                PID - Patient Identification
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Patient ID (PID-3) *
                  </label>
                  <input
                    type="text"
                    value={formData.pid.patientId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pid: { ...formData.pid, patientId: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Patient Name (PID-5)
                  </label>
                  <input
                    type="text"
                    value={formData.pid.patientName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pid: { ...formData.pid, patientName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="DOE^JOHN^MIDDLE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date of Birth (PID-7)
                  </label>
                  <input
                    type="text"
                    value={formData.pid.dateOfBirth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pid: { ...formData.pid, dateOfBirth: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="19800101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sex (PID-8)
                  </label>
                  <select
                    value={formData.pid.sex}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pid: { ...formData.pid, sex: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select...</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                    <option value="U">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address (PID-11)
                  </label>
                  <input
                    type="text"
                    value={formData.pid.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pid: { ...formData.pid, address: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="123 MAIN ST^^CITY^ST^12345"
                  />
                </div>
              </div>
            </div>

            {/* TXA Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                TXA - Transcription Document Header
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Document Type (TXA-2) *
                  </label>
                  <input
                    type="text"
                    value={formData.txa.documentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        txa: { ...formData.txa, documentType: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="DOC^Document^HL70019"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Presentation (TXA-3)
                  </label>
                  <input
                    type="text"
                    value={formData.txa.contentPresentation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        txa: { ...formData.txa, contentPresentation: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="TEXT^Plain Text^HL70019"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Activity Date/Time (TXA-4)
                  </label>
                  <input
                    type="text"
                    value={formData.txa.activityDateTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        txa: { ...formData.txa, activityDateTime: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="YYYYMMDDHHMMSS (auto-generated if empty)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Primary Activity Provider (TXA-5)
                  </label>
                  <input
                    type="text"
                    value={formData.txa.primaryActivityProvider}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        txa: { ...formData.txa, primaryActivityProvider: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="DOC001^SMITH^JANE^MD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Completion Status (TXA-12) *
                  </label>
                  <select
                    value={formData.txa.completionStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        txa: { ...formData.txa, completionStatus: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select...</option>
                    <option value="COMP^Complete^HL70272">Complete</option>
                    <option value="DI^Dictated^HL70272">Dictated</option>
                    <option value="DO^Documented^HL70272">Documented</option>
                    <option value="IN^Incomplete^HL70272">Incomplete</option>
                    <option value="IP^In Progress^HL70272">In Progress</option>
                    <option value="PA^Pre-authenticated^HL70272">Pre-authenticated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unique Document Number (TXA-16)
                  </label>
                  <input
                    type="text"
                    value={formData.txa.uniqueDocumentNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        txa: { ...formData.txa, uniqueDocumentNumber: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="DOC123456789"
                  />
                </div>
              </div>
            </div>

            {/* PV1 Section (Optional) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  PV1 - Patient Visit (Optional)
                </h2>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includePV1}
                    onChange={(e) => setIncludePV1(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include PV1</span>
                </label>
              </div>
              {includePV1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Patient Class (PV1-2)
                    </label>
                    <select
                      value={pv1Data.patientClass}
                      onChange={(e) =>
                        setPv1Data({ ...pv1Data, patientClass: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select...</option>
                      <option value="I">Inpatient</option>
                      <option value="O">Outpatient</option>
                      <option value="E">Emergency</option>
                      <option value="P">Preadmit</option>
                      <option value="R">Recurring Patient</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assigned Patient Location (PV1-3)
                    </label>
                    <input
                      type="text"
                      value={pv1Data.assignedPatientLocation}
                      onChange={(e) =>
                        setPv1Data({ ...pv1Data, assignedPatientLocation: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="ICU^101^A"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* OBX Section (Optional) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  OBX - Observation/Result (Optional)
                </h2>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeOBX}
                    onChange={(e) => setIncludeOBX(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include OBX</span>
                </label>
              </div>
              {includeOBX && (
                <div className="space-y-4">
                  {obxData.map((obx, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          OBX Segment {idx + 1}
                        </h3>
                        {obxData.length > 1 && (
                          <button
                            onClick={() => removeOBX(idx)}
                            className="text-red-600 dark:text-red-400 hover:underline text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Set ID (OBX-1)
                          </label>
                          <input
                            type="text"
                            value={obx.setId}
                            onChange={(e) => {
                              const newObx = [...obxData];
                              newObx[idx].setId = e.target.value;
                              setObxData(newObx);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Value Type (OBX-2)
                          </label>
                          <input
                            type="text"
                            value={obx.valueType}
                            onChange={(e) => {
                              const newObx = [...obxData];
                              newObx[idx].valueType = e.target.value;
                              setObxData(newObx);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="TX"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Observation Identifier (OBX-3)
                          </label>
                          <input
                            type="text"
                            value={obx.observationIdentifier}
                            onChange={(e) => {
                              const newObx = [...obxData];
                              newObx[idx].observationIdentifier = e.target.value;
                              setObxData(newObx);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="NOTE^Clinical Note^L"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Observation Value (OBX-5)
                          </label>
                          <textarea
                            value={obx.observationValue}
                            onChange={(e) => {
                              const newObx = [...obxData];
                              newObx[idx].observationValue = e.target.value;
                              setObxData(newObx);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows={3}
                            placeholder="Observation value or note text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Units (OBX-6)
                          </label>
                          <input
                            type="text"
                            value={obx.units}
                            onChange={(e) => {
                              const newObx = [...obxData];
                              newObx[idx].units = e.target.value;
                              setObxData(newObx);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addOBX}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    + Add Another OBX Segment
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Generate HL7 Message
            </button>
          </div>

          {/* Generated Message Section */}
          {generatedMessage && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Generated HL7 Message
              </h2>
              <div className="mb-4">
                <textarea
                  value={generatedMessage}
                  readOnly
                  className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Copy HL7
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Download .hl7
                </button>
                <button
                  onClick={handleInspect}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Inspect Generated Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

