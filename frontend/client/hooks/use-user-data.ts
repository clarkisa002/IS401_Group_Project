import { useState, useEffect } from "react";
import { UserData, DEMO_DATA } from "@/lib/types";

const STORAGE_KEY = "home_ownership_tracker_data";

export function useUserData() {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse local storage data", e);
        setData(DEMO_DATA);
      }
    } else {
      setData(DEMO_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_DATA));
    }
    setLoading(false);
  }, []);

  const updateData = (newData: UserData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const resetToDemo = () => {
    setData(DEMO_DATA);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_DATA));
  };

  const exportData = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "home-readiness-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        updateData(imported);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return { data, loading, updateData, resetToDemo, exportData, importData };
}
