import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

export default function ChartGeneratorApp() {
  const [chartData, setChartData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [xKey, setXKey] = useState("");
  const [yKeys, setYKeys] = useState([]);
  const [chartTypes, setChartTypes] = useState({});

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setChartData(jsonData);
      if (jsonData.length > 0) {
        const keys = Object.keys(jsonData[0]);
        setHeaders(keys);
        setXKey(keys[0]);
        setYKeys([keys[1]]);
        setChartTypes({ [keys[1]]: "bar" });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleXKeyChange = (e) => {
    setXKey(e.target.value);
  };

  const handleYKeyToggle = (key) => {
    setYKeys((prev) => {
      const updated = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      return updated;
    });
    setChartTypes((prev) => ({ ...prev, [key]: prev[key] || "bar" }));
  };

  const handleChartTypeChange = (key, type) => {
    setChartTypes((prev) => ({ ...prev, [key]: type }));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Chart Generator from Excel/CSV</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} />
        </CardContent>
      </Card>

      {headers.length > 1 && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="block font-medium">Select X-Axis Key:</label>
              <select value={xKey} onChange={handleXKeyChange} className="w-full p-2 border rounded">
                {headers.map((header) => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Select Y-Axis Keys and Chart Types:</label>
              {headers.map((header) => (
                header !== xKey && (
                  <div key={header} className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={yKeys.includes(header)}
                      onChange={() => handleYKeyToggle(header)}
                    />
                    <span>{header}</span>
                    {yKeys.includes(header) && (
                      <select
                        value={chartTypes[header] || "bar"}
                        onChange={(e) => handleChartTypeChange(header, e.target.value)}
                        className="p-1 border rounded"
                      >
                        <option value="bar">Bar</option>
                        <option value="line">Line</option>
                      </select>
                    )}
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && xKey && yKeys.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                {yKeys.map((key, index) => {
                  const type = chartTypes[key] || "bar";
                  return type === "line" ? (
                    <Line key={key} dataKey={key} stroke={getColor(index)} strokeWidth={2} dot={false} />
                  ) : (
                    <Bar key={key} dataKey={key} fill={getColor(index)} />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getColor(index) {
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1"];
  return colors[index % colors.length];
}
