// ScalaZap Pixel Tracking Utility

interface UserData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  externalId?: string
}

interface CustomData {
  value?: number
  currency?: string
  contentName?: string
  contentCategory?: string
  contentIds?: string[]
  contentType?: string
  orderId?: string
  predictedLtv?: number
}

interface Pixel {
  id: string
  name: string
  type: "facebook" | "google" | "tiktok" | "custom"
  pixelId: string
  accessToken: string
  testEventCode?: string
  status: "active" | "inactive"
  events: { name: string; enabled: boolean; count: number }[]
}

// Get configured pixels from localStorage
function getActivePixels(): Pixel[] {
  if (typeof window === "undefined") return []
  
  try {
    const saved = localStorage.getItem("scalazap_pixels")
    if (saved) {
      const pixels: Pixel[] = JSON.parse(saved)
      return pixels.filter(p => p.status === "active")
    }
  } catch (e) {
    console.error("Error loading pixels:", e)
  }
  return []
}

// Track an event to all configured pixels
export async function trackEvent(
  eventName: string,
  userData?: UserData,
  customData?: CustomData
): Promise<void> {
  const pixels = getActivePixels()
  
  if (pixels.length === 0) {
    console.log("[ScalaZap] No active pixels configured")
    return
  }

  try {
    await fetch("/api/pixels/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        userData,
        customData,
        eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
        actionSource: "website",
        pixels,
      }),
    })
    
    // Update event count locally
    const updatedPixels = pixels.map(p => ({
      ...p,
      events: p.events.map(e => 
        e.name === eventName && e.enabled 
          ? { ...e, count: e.count + 1 }
          : e
      ),
      pageViews: eventName.toLowerCase().includes("page") ? p.pageViews + 1 : p.pageViews,
      conversions: !eventName.toLowerCase().includes("page") ? p.conversions + 1 : p.conversions,
    }))
    
    localStorage.setItem("scalazap_pixels", JSON.stringify(updatedPixels))
    
    console.log(`[ScalaZap] Event "${eventName}" tracked to ${pixels.length} pixel(s)`)
  } catch (error) {
    console.error("[ScalaZap] Error tracking event:", error)
  }
}

// Predefined event helpers
export const PixelEvents = {
  // Page Events
  pageView: () => trackEvent("PageView"),
  viewContent: (contentName?: string, contentCategory?: string) => 
    trackEvent("ViewContent", undefined, { contentName, contentCategory }),
  
  // Lead Events
  lead: (userData?: UserData, value?: number) => 
    trackEvent("Lead", userData, { value }),
  completeRegistration: (userData?: UserData) => 
    trackEvent("CompleteRegistration", userData),
  contact: (userData?: UserData) => 
    trackEvent("Contact", userData),
  subscribe: (userData?: UserData, value?: number) => 
    trackEvent("Subscribe", userData, { value }),
  
  // E-commerce Events
  addToCart: (contentIds?: string[], value?: number) => 
    trackEvent("AddToCart", undefined, { contentIds, value }),
  initiateCheckout: (value?: number, contentIds?: string[]) => 
    trackEvent("InitiateCheckout", undefined, { value, contentIds }),
  purchase: (userData?: UserData, value?: number, orderId?: string) => 
    trackEvent("Purchase", userData, { value, orderId }),
  
  // Custom Event
  custom: (eventName: string, userData?: UserData, customData?: CustomData) => 
    trackEvent(eventName, userData, customData),
}

// Auto-track PageView when the script loads
if (typeof window !== "undefined") {
  // Track PageView after a short delay to ensure pixels are loaded
  setTimeout(() => {
    PixelEvents.pageView()
  }, 100)
}
