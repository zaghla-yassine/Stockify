import React, { useState, useEffect, useRef } from "react";
import stockList from "./stocks";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const StockReportScreen = () => {
  const [analysisType, setAnalysisType] = useState(null);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const reportRef = useRef(null);

  useEffect(() => {
    setSelectedStocks([]);
    setReport(null);
    setError(null);
  }, [analysisType]);

  const handleTypeSelect = (type) => {
    setAnalysisType(type);
  };

  const handleStockSelect = (index, value) => {
    if (value && selectedStocks.includes(value)) {
      alert(
        `${
          stockList.find((s) => s.value === value)?.label || value
        } is already selected. Please choose a different stock.`
      );
      const newSelection = [...selectedStocks];
      newSelection[index] = "";
      setSelectedStocks(newSelection.filter((s) => s));
      return;
    }

    const newSelection = [...selectedStocks];
    newSelection[index] = value;
    setSelectedStocks(newSelection.filter((s) => s));
  };

  const getNumberOfSelections = () => {
    if (analysisType === "single") return 1;
    if (analysisType === "compare2") return 2;
    return 0;
  };

  const canSubmit = () => {
    const requiredCount = getNumberOfSelections();
    const uniqueSelected = new Set(selectedStocks.filter((s) => s));
    return requiredCount > 0 && uniqueSelected.size === requiredCount;
  };
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch(`${apiUrl}/generate_report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbols: selectedStocks }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && data.report) {
        setReport(data.report);
      } else {
        throw new Error(
          data.message || "Failed to generate report or invalid format."
        );
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    try {
      const topPaddingPt = 30;
      const bottomPaddingPt = 30;
      const leftPaddingPt = 30;
      const rightPaddingPt = 30;

      const fullCanvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const contentWidthPt = pdfPageWidth - leftPaddingPt - rightPaddingPt;
      const contentHeightPt = pdfPageHeight - topPaddingPt - bottomPaddingPt;

      const canvasWidthPx = fullCanvas.width;
      const canvasHeightPx = fullCanvas.height;

      const pxToPtScaleX = contentWidthPt / canvasWidthPx;
      const pageContentHeightPx = contentHeightPt / pxToPtScaleX;

      const totalPages = Math.ceil(canvasHeightPx / pageContentHeightPx);

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const sy = pageIndex * pageContentHeightPx;
        const thisSliceHeightPx =
          pageIndex === totalPages - 1
            ? canvasHeightPx - sy
            : pageContentHeightPx;

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvasWidthPx;
        sliceCanvas.height = thisSliceHeightPx;
        const sliceCtx = sliceCanvas.getContext("2d");

        sliceCtx.drawImage(
          fullCanvas,
          0,
          sy,
          canvasWidthPx,
          thisSliceHeightPx,
          0,
          0,
          canvasWidthPx,
          thisSliceHeightPx
        );

        const sliceImgData = sliceCanvas.toDataURL("image/png");

        const sliceHeightPt = thisSliceHeightPx * pxToPtScaleX;

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          sliceImgData,
          "PNG",
          leftPaddingPt, // x position with left padding
          topPaddingPt, // y position with top padding
          contentWidthPt, // width scaled to fit content area
          sliceHeightPt // height scaled proportionally
        );
      }
      pdf.save("stock_report_padded.pdf");
    } catch (err) {
      console.error("Error generating multi‐page PDF with padding:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };
  const screenStyle = {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    padding: "30px",
    maxWidth: "900px",
    margin: "40px auto",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e0e0e0",
  };

  const headerStyle = {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "30px",
    fontSize: "2em",
    fontWeight: "600",
  };

  const sectionStyle = {
    marginBottom: "30px",
    padding: "20px",
    border: "1px solid #eee",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "10px",
    fontWeight: "500",
    color: "#34495e",
  };

  const buttonGroupStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "25px",
  };

  const buttonStyle = (isActive) => ({
    padding: "10px 20px",
    fontSize: "1em",
    cursor: "pointer",
    border: `1px solid ${isActive ? "#3498db" : "#bdc3c7"}`,
    borderRadius: "5px",
    backgroundColor: isActive ? "#3498db" : "#ffffff",
    color: isActive ? "#ffffff" : "#34495e",
    transition: "all 0.3s ease",
    fontWeight: isActive ? "bold" : "normal",
  });

  const selectContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px",
  };

  const selectStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1em",
    backgroundColor: "#fff",
    boxSizing: "border-box",
  };

  const selectedInfoStyle = {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#ecf0f1",
    borderRadius: "5px",
    color: "#7f8c8d",
    fontSize: "0.9em",
  };

  const submitButtonStyle = {
    display: "block",
    width: "100%",
    padding: "15px",
    fontSize: "1.1em",
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#2ecc71",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    opacity: canSubmit() ? 1 : 0.6,
  };

  const loadingStyle = {
    textAlign: "center",
    fontSize: "1.2em",
    color: "#3498db",
    marginTop: "30px",
    padding: "20px",
    border: "1px dashed #3498db",
    borderRadius: "5px",
    backgroundColor: "#eaf5ff",
  };

  const errorStyle = {
    textAlign: "center",
    fontSize: "1.1em",
    color: "#e74c3c",
    marginTop: "30px",
    padding: "20px",
    border: "1px solid #e74c3c",
    borderRadius: "5px",
    backgroundColor: "#fdedec",
  };

  const reportStyle = {
    marginTop: "30px",
    padding: "25px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    lineHeight: "1.6",
    color: "#333",
    "h1, h2, h3": {
      color: "#2c3e50",
      borderBottom: "1px solid #eee",
      paddingBottom: "30px",
      marginTop: "20px",
      marginBottom: "15px",
    },
    "ul, ol": {
      paddingLeft: "20px",
    },
    li: {
      marginBottom: "8px",
    },
    code: {
      backgroundColor: "#f0f0f0",
      padding: "2px 5px",
      borderRadius: "3px",
      fontFamily: "monospace",
    },
    blockquote: {
      borderLeft: "4px solid #ccc",
      paddingLeft: "15px",
      color: "#666",
      margin: "15px 0",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "15px",
      marginBottom: "15px",
    },
    "th, td": {
      border: "1px solid #ddd",
      padding: "10px",
      textAlign: "left",
    },
    th: {
      backgroundColor: "#f2f2f2",
      fontWeight: "bold",
    },
  };

  const renderSelects = () => {
    const count = getNumberOfSelections();
    if (count === 0) return null;

    return Array.from({ length: count }).map((_, index) => {
      const currentSelection = selectedStocks[index] || "";
      const availableOptions = stockList.filter(
        (stock) =>
          !selectedStocks.includes(stock.value) ||
          stock.value === currentSelection
      );

      return (
        <div key={index}>
          <label htmlFor={`stock-select-${index}`} style={labelStyle}>
            Select Stock {index + 1}:
          </label>
          <select
            id={`stock-select-${index}`}
            value={currentSelection}
            onChange={(e) => handleStockSelect(index, e.target.value)}
            style={selectStyle}
          >
            <option value="">-- Select Stock --</option>
            {availableOptions.map((stockObj) => (
              <option key={stockObj.value} value={stockObj.value}>
                {stockObj.label}
              </option>
            ))}
          </select>
        </div>
      );
    });
  };

  return (
    <div style={screenStyle}>
      <h1 style={headerStyle}>Stock Analysis Report Generator</h1>

      <div style={sectionStyle}>
        <label style={labelStyle}>1. Choose Analysis Type:</label>
        <div style={buttonGroupStyle}>
          <button
            onClick={() => handleTypeSelect("single")}
            style={buttonStyle(analysisType === "single")}
          >
            Single Stock
          </button>
          <button
            onClick={() => handleTypeSelect("compare2")}
            style={buttonStyle(analysisType === "compare2")}
          >
            Compare 2 Stocks
          </button>
        </div>
      </div>

      {analysisType && (
        <div style={sectionStyle}>
          <label style={labelStyle}>2. Select Stocks:</label>
          <div style={selectContainerStyle}>{renderSelects()}</div>
          {selectedStocks.length > 0 && (
            <div style={selectedInfoStyle}>
              Selected:{" "}
              {selectedStocks
                .map(
                  (ticker) =>
                    stockList.find((s) => s.value === ticker)?.label || ticker
                )
                .join(", ")}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit() || loading}
            style={{ ...submitButtonStyle, marginTop: "20px" }}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      )}

      {loading && (
        <div style={loadingStyle}>
          Generating report, please wait... This may take some time.
        </div>
      )}

      {error && <div style={errorStyle}>Error: {error}</div>}

      {report && !loading && (
        <div style={sectionStyle}>
          <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
            Generated Report
          </h2>

          <button
            onClick={handleDownloadPdf}
            style={{
              display: "inline-block",
              marginBottom: "20px",
              padding: "10px 20px",
              backgroundColor: "#2980b9",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Download PDF
          </button>

          <div ref={reportRef} style={reportStyle}>
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockReportScreen;
