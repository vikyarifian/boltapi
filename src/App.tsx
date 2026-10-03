import React, { useState, useEffect } from "react";

interface SuratJalan {
  id: number;
  nomor: string;
  vendor_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface WebhookLog {
  id: number;
  received_at: string;
  payload: string;
  topic: string;
}

export default function App() {
  const [suratJalanList, setSuratJalanList] = useState<SuratJalan[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [newNomor, setNewNomor] = useState("");
  const [newVendor, setNewVendor] = useState("Sinar Jaya Logistik");
  const [error, setError] = useState("");
  
  // Simulator State
  const [simNomor, setSimNomor] = useState("");
  const [simStatus, setSimStatus] = useState("DISPATCHED");

  const fetchData = async () => {
    try {
      const resSJ = await fetch("/api/surat-jalan");
      const dataSJ = await resSJ.json();
      setSuratJalanList(dataSJ);

      const resWH = await fetch("/api/webhooks");
      const dataWH = await resWH.json();
      setWebhookLogs(dataWH);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateSuratJalan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newNomor.trim()) {
      setError("Nomor Surat Jalan tidak boleh kosong");
      return;
    }

    try {
      const res = await fetch("/api/surat-jalan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomor: newNomor.trim(), vendor_name: newVendor }),
      });
      if (res.ok) {
        setNewNomor("");
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.error || "Gagal menyimpan");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan");
    }
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simNomor.trim()) return;

    try {
      const res = await fetch("/api/webhook/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomor: simNomor.trim(),
          status: simStatus,
          event: "DELIVERY_UPDATE",
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSimNomor("");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to simulate webhook:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-wide">BoltAPI Logistics</h1>
            <p className=