// API utility functions for Smart Adapter backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost/websystem";

export interface AdapterData {
  adapter_id: string;
  label: string;
  location: string;
  model: string;
  max_voltage: number;
  status: "active" | "inactive" | "overload" | "undervoltage";
  registered_date: string;
  last_updated: string;
}

export interface VoltageLog {
  id: number;
  adapter_id: string;
  voltage: number;
  timestamp: string;
  status: "normal" | "warning" | "overload" | "undervoltage";
}

export interface Notification {
  id: string;
  user_id: string;
  adapter_id?: string;
  title: string;
  message: string;
  notification_type: "info" | "warning" | "success" | "error";
  priority: "low" | "medium" | "high";
  read: number;
  created_at: string;
}

// Fetch adapters for user
export async function getAdapters(userId: string): Promise<AdapterData[]> {
  try {
    const response = await fetch(`${API_BASE}/list.php?user_id=${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch adapters:", error);
    return [];
  }
}

// Fetch voltage history for adapter
export async function getVoltageHistory(
  adapterId: string,
  userId: string,
  limit: number = 30
): Promise<VoltageLog[]> {
  try {
    const response = await fetch(
      `${API_BASE}/get-voltage-history.php?adapter_id=${encodeURIComponent(adapterId)}&user_id=${encodeURIComponent(userId)}&limit=${limit}`
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch voltage history:", error);
    return [];
  }
}

// Fetch notifications for user
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    // Assuming a GET endpoint exists; adjust if needed
    const response = await fetch(`${API_BASE}/get-notifications.php?user_id=${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

// Save voltage reading
export async function saveVoltageReading(
  adapterId: string,
  voltage: number,
  userId: string,
  status?: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/save-voltage.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adapter_id: adapterId, voltage, user_id: userId, status }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to save voltage reading:", error);
    return false;
  }
}

// Add new adapter
export async function addAdapter(
  adapterId: string,
  userId: string,
  label: string,
  location: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/add.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adapter_id: adapterId, user_id: userId, label, location }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to add adapter:", error);
    return false;
  }
}

// Delete adapter
export async function deleteAdapter(adapterId: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/delete.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adapter_id: adapterId, user_id: userId }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete adapter:", error);
    return false;
  }
}

// Update adapter label
export async function updateAdapterLabel(
  adapterId: string,
  userId: string,
  label: string,
  location?: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/update-label.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adapter_id: adapterId, user_id: userId, label, location }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to update adapter label:", error);
    return false;
  }
}
