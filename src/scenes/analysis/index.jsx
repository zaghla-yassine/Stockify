import React, { useState, useMemo } from "react";
import "ag-charts-enterprise";
import { AgCharts } from "ag-charts-react";
import { FiDownload, FiSearch } from "react-icons/fi";
import stockList from "./stocks";

const StockDataPage = () => {
  const [selectedStock, setSelectedStock] = useState("");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFetchData = async () => {
    if (!selectedStock) return;
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: selectedStock }),
      });
      const data = await response.json();
      setStockData(data);
      setSearchTerm("");
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = stockData.filter((row) => {
    const dateString = new Date(row.Date).toLocaleDateString();
    return dateString.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const chartData = useMemo(() => {
    return filteredData.map((row) => ({
      date: new Date(row.Date),
      open: row.Open,
      high: row.High,
      low: row.Low,
      close: row.Close,
      volume: row.Volume,
    }));
  }, [filteredData]);

  const chartOptions = useMemo(() => {
    return {
      autoSize: true,
      title: {
        text: selectedStock
          ? `${selectedStock} Candlestick Chart`
          : "Candlestick Chart",
        fontSize: 16,
      },
      axes: [
        {
          type: "time",
          position: "bottom",
          label: { rotation: 0, format: "%d %b %Y" },
          nice: false,
        },
        {
          type: "number",
          position: "left",
          title: { text: "Prix", fontSize: 12 },
          nice: true,
        },
      ],
      series: [
        {
          type: "candlestick",
          xKey: "date",
          openKey: "open",
          highKey: "high",
          lowKey: "low",
          closeKey: "close",
          tooltip: {
            renderer: (params) => {
              const { xValue, openValue, highValue, lowValue, closeValue } =
                params.datum;
              return {
                content:
                  `<b>${new Date(xValue).toLocaleDateString()}</b><br/>` +
                  `open: ${openValue.toFixed(2)}<br/>` +
                  `high: ${highValue.toFixed(2)}<br/>` +
                  `low: ${lowValue.toFixed(2)}<br/>` +
                  `close: ${closeValue.toFixed(2)}`,
              };
            },
          },
        },
      ],
      data: chartData,
      interactions: [
        { type: "zoomRect", axes: { x: true, y: false } },
        { type: "zoom", axes: { x: true, y: false } },
        { type: "pan", axes: { x: true, y: false } },
      ],
      navigator: { enabled: true },
    };
  }, [chartData, selectedStock]);

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }
    const headers = ["Date", "Close", "High", "Low", "Open", "Volume"];
    const csvRows = [
      headers.join(","),
      ...filteredData.map((row) => {
        const dateString = new Date(row.Date).toLocaleDateString();
        const close = row.Close.toFixed(2);
        const high = row.High.toFixed(2);
        const low = row.Low.toFixed(2);
        const open = row.Open.toFixed(2);
        const volume = row.Volume.toLocaleString();
        return [dateString, close, high, low, open, volume].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedStock || "stocks"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      {/* ───────────── SIDEBAR ───────────── */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#f0f3f8",
          padding: "20px",
        }}
      >
        <h3>Stock Selector</h3>
        <label htmlFor="stock-select">Select a Stock Ticker</label>
        <select
          id="stock-select"
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "10px" }}
        >
          <option value="">-- Select --</option>
          {stockList.map((stockObj) => (
            <option key={stockObj.value} value={stockObj.value}>
              {stockObj.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleFetchData}
          disabled={!selectedStock || loading}
          style={{ marginTop: "20px", width: "100%", padding: "10px" }}
        >
          {loading ? "Loading..." : "Fetch Data"}
        </button>
      </div>

      <div
        style={{
          flex: 1,
          padding: "40px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1>Stock Visualisation Dashboard</h1>

        {selectedStock && (
          <h2>
            Selected Stock:{" "}
            {stockList.find((s) => s.value === selectedStock)?.label ||
              selectedStock}
          </h2>
        )}

        <h3>Historical Data</h3>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div style={{ position: "relative", marginRight: "10px" }}>
            <input
              type="text"
              placeholder="Rechercher par date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 30px 8px 10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <FiSearch
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#888",
              }}
            />
          </div>
          <button
            onClick={exportToCSV}
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "8px 12px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <FiDownload style={{ marginRight: "6px" }} />
            Exporter
          </button>
        </div>

        <div
          style={{
            flex: 1,
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f7f7f7" }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Close</th>
                <th style={thStyle}>High</th>
                <th style={thStyle}>Low</th>
                <th style={thStyle}>Open</th>
                <th style={thStyle}>Volume</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index}>
                  <td style={tdStyle}>
                    {new Date(row.Date).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>{row.Close.toFixed(2)}</td>
                  <td style={tdStyle}>{row.High.toFixed(2)}</td>
                  <td style={tdStyle}>{row.Low.toFixed(2)}</td>
                  <td style={tdStyle}>{row.Open.toFixed(2)}</td>
                  <td style={tdStyle}>{row.Volume.toLocaleString()}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
                    {stockData.length === 0
                      ? "No data to display"
                      : "Aucun résultat pour cette date."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ───────────── AG Charts ───────────── */}
        <div className="chart-container" style={{ flex: 1, marginTop: "30px" }}>
          {chartData.length > 0 ? (
            <AgCharts options={chartOptions} />
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#999",
                marginTop: "20px",
              }}
            >
              {stockData.length === 0
                ? "Sélectionnez un ticker et cliquez sur 'Fetch Data' pour afficher le chart."
                : "Aucun point de données à afficher dans le chart (filtre trop restrictif)."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const thStyle = {
  padding: "10px",
  borderBottom: "1px solid #ccc",
  textAlign: "left",
  fontSize: "14px",
};
const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  fontSize: "14px",
};

export default StockDataPage;
