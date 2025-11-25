// Simulation of database for v0 preview environment
// This allows the app to function without the actual PHP/MySQL backend

type Adapter = {
  id: string
  name: string
  label?: string | null
  location?: string | null
  addedAt: string
  userId: number
  status: "active" | "inactive" | "maintenance"
}

type VoltageReading = {
  voltage: number
  status: "active" | "inactive" | "overload" | "undervoltage"
  time: string // HH:MM:SS
  recorded_at: number // timestamp
}

// Valid adapters that exist in the "warehouse" (from schema.sql)
export const VALID_ADAPTERS = [
  { id: "55555", model: "SA-2025-X", maxVoltage: 240.0 },
  { id: "1AAAA", model: "SA-2025-X", maxVoltage: 240.0 },
  { id: "22AAA", model: "SA-2025-PRO", maxVoltage: 250.0 },
  { id: "AAAAA", model: "SA-2025-LITE", maxVoltage: 230.0 },
  { id: "333AA", model: "SA-2025-X", maxVoltage: 240.0 },
  { id: "4444A", model: "SA-2025-PRO", maxVoltage: 250.0 },
]

export function generateMockHistory(count: number): VoltageReading[] {
  const readings: VoltageReading[] = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    // Generate times going back 1 minute per reading
    const time = new Date(now - (count - 1 - i) * 60000)
    // Random voltage between 215 and 225
    const voltage = 215 + Math.random() * 10

    readings.push({
      voltage: Number.parseFloat(voltage.toFixed(2)),
      status: voltage > 240 ? "overload" : voltage < 200 ? "undervoltage" : "active",
      time: time.toLocaleTimeString("en-US", { hour12: false }),
      recorded_at: time.getTime() / 1000,
    })
  }
  return readings
}

// Global store to persist across requests in dev environment
const globalStore = globalThis as unknown as {
  mockDb: {
    userAdapters: Adapter[]
    voltageHistory: Record<string, VoltageReading[]>
  }
}

// This ensures initialization happens at runtime, preventing module loading order issues.
export const getDb = () => {
  if (!globalStore.mockDb) {
    globalStore.mockDb = {
      userAdapters: [],
      voltageHistory: {},
    }
  }
  return globalStore.mockDb
}
