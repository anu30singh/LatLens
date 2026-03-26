import { useState, useEffect } from "react";
import "./index.css";

export default function Popup() {
  const [mode, setMode] = useState("DD_TO_DMS");

  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const [latDeg, setLatDeg] = useState("");
  const [latMin, setLatMin] = useState("");
  const [latSec, setLatSec] = useState("");
  const [latDir, setLatDir] = useState("N");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");



  function toDMS(decimal) {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);

    return { degrees, minutes, seconds };
  }

  function toDecimal(deg, min, sec, direction) {
    let decimal = deg + min / 60 + sec / 3600;
    if (direction === "S") decimal *= -1;
    return decimal.toFixed(6);
  }

  function validate() {
    if (mode === "DD_TO_DMS") {
      if (!lat || !lon) return "Enter both latitude & longitude";
      if (isNaN(lat) || isNaN(lon)) return "Invalid numeric values";
      if (lat < -90 || lat > 90) return "Latitude must be -90 to 90";
      if (lon < -180 || lon > 180) return "Longitude must be -180 to 180";
    } else {
      if (!latDeg || !latMin || !latSec) return "Fill all DMS fields";
    }
    return "";
  }

  const handleConvert = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");

    if (mode === "DD_TO_DMS") {
      const latDMS = toDMS(parseFloat(lat));
      const lonDMS = toDMS(parseFloat(lon));

      const data = { latDMS, lonDMS };
      setResult(data);
      chrome.storage.local.set({ result: data });
    } else {
      const decimal = toDecimal(
        Number(latDeg),
        Number(latMin),
        Number(latSec),
        latDir
      );

      setResult(decimal);
      chrome.storage.local.set({ result: decimal });
    }
  };

  const handleClear = () => {
    setResult(null);
    setError("");
    chrome.storage.local.remove("result");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      mode === "DD_TO_DMS"
        ? `${lat}, ${lon}`
        : `${result}`
    );
  };

  return (
    <div className="w-[320px] p-4 bg-slate-900 text-white shadow-2xl border border-slate-700">

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">LatLens 🌍</h2>
        <p className="text-xs text-slate-400">Geo Intelligence Tool</p>
      </div>

      {/* Toggle */}
      <div className="flex bg-slate-800 rounded-lg p-1 mb-4">
        <button
          onClick={() => setMode("DD_TO_DMS")}
          className={`flex-1 py-1.5 text-sm rounded-md ${
            mode === "DD_TO_DMS" ? "bg-blue-600" : "text-slate-400"
          }`}
        >
          DD → DMS
        </button>

        <button
          onClick={() => setMode("DMS_TO_DD")}
          className={`flex-1 py-1.5 text-sm rounded-md ${
            mode === "DMS_TO_DD" ? "bg-blue-600" : "text-slate-400"
          }`}
        >
          DMS → DD
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        {mode === "DD_TO_DMS" && (
          <>
            <input
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="input-modern"
            />
            <input
              placeholder="Longitude"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="input-modern"
            />
          </>
        )}

        {mode === "DMS_TO_DD" && (
          <>
            <input placeholder="Degrees" onChange={(e) => setLatDeg(e.target.value)} className="input-modern" />
            <input placeholder="Minutes" onChange={(e) => setLatMin(e.target.value)} className="input-modern" />
            <input placeholder="Seconds" onChange={(e) => setLatSec(e.target.value)} className="input-modern" />
            <select onChange={(e) => setLatDir(e.target.value)} className="input-modern">
              <option>N</option>
              <option>S</option>
            </select>
          </>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {/* Convert */}
      <button
        onClick={handleConvert}
        className="w-full mt-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700"
      >
        Convert
      </button>

      {/* Result */}
      {result && (
        <div className="mt-4 p-3 bg-slate-800 rounded-lg text-sm">
          {mode === "DD_TO_DMS" ? (
            <>
              <p>Lat: {result.latDMS.degrees}° {result.latDMS.minutes}' {result.latDMS.seconds}"</p>
              <p>Lon: {result.lonDMS.degrees}° {result.lonDMS.minutes}' {result.lonDMS.seconds}"</p>
            </>
          ) : (
            <p>{result}</p>
          )}

          {/* Copy */}
          <button
            onClick={copyToClipboard}
            className="text-xs text-blue-400 mt-2"
          >
            Copy
          </button>
        </div>
      )}

      {/* Map Preview */}
      {lat && lon && (
        <div className="mt-4 rounded-lg overflow-hidden border border-slate-700">
          <iframe
            width="100%"
            height="180"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${lat},${lon}&z=12&output=embed`}
          ></iframe>
        </div>
      )}

      {/* Clear */}
      {result && (
        <button onClick={handleClear} className="text-xs text-red-400 mt-2">
          Clear
        </button>
      )}
    </div>
  );
}