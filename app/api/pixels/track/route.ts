import { NextRequest, NextResponse } from "next/server"

// This API receives events and forwards them to configured pixels via Conversion API

interface TrackEventRequest {
  eventName: string
  userData?: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
    externalId?: string
    clientIpAddress?: string
    clientUserAgent?: string
    fbc?: string // Facebook click ID
    fbp?: string // Facebook browser ID
  }
  customData?: {
    value?: number
    currency?: string
    contentName?: string
    contentCategory?: string
    contentIds?: string[]
    contentType?: string
    orderId?: string
    predictedLtv?: number
  }
  eventSourceUrl?: string
  actionSource?: "website" | "app" | "email" | "phone_call" | "chat" | "physical_store" | "system_generated" | "other"
}

// Hash function for user data (required by Facebook CAPI)
async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

// Send event to Facebook Conversion API
async function sendToFacebook(
  pixelId: string,
  accessToken: string,
  event: TrackEventRequest,
  testEventCode?: string
) {
  const url = `https://graph.facebook.com/v18.0/${pixelId}/events`
  
  const userData: Record<string, string> = {}
  
  if (event.userData) {
    if (event.userData.email) {
      userData.em = await hashData(event.userData.email)
    }
    if (event.userData.phone) {
      userData.ph = await hashData(event.userData.phone.replace(/\D/g, ""))
    }
    if (event.userData.firstName) {
      userData.fn = await hashData(event.userData.firstName)
    }
    if (event.userData.lastName) {
      userData.ln = await hashData(event.userData.lastName)
    }
    if (event.userData.city) {
      userData.ct = await hashData(event.userData.city)
    }
    if (event.userData.state) {
      userData.st = await hashData(event.userData.state)
    }
    if (event.userData.country) {
      userData.country = await hashData(event.userData.country)
    }
    if (event.userData.zipCode) {
      userData.zp = await hashData(event.userData.zipCode)
    }
    if (event.userData.externalId) {
      userData.external_id = await hashData(event.userData.externalId)
    }
    if (event.userData.clientIpAddress) {
      userData.client_ip_address = event.userData.clientIpAddress
    }
    if (event.userData.clientUserAgent) {
      userData.client_user_agent = event.userData.clientUserAgent
    }
    if (event.userData.fbc) {
      userData.fbc = event.userData.fbc
    }
    if (event.userData.fbp) {
      userData.fbp = event.userData.fbp
    }
  }

  const eventData = {
    event_name: event.eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: event.actionSource || "website",
    event_source_url: event.eventSourceUrl,
    user_data: userData,
    custom_data: event.customData ? {
      value: event.customData.value,
      currency: event.customData.currency || "BRL",
      content_name: event.customData.contentName,
      content_category: event.customData.contentCategory,
      content_ids: event.customData.contentIds,
      content_type: event.customData.contentType,
      order_id: event.customData.orderId,
      predicted_ltv: event.customData.predictedLtv,
    } : undefined,
  }

  const body: Record<string, any> = {
    data: [eventData],
    access_token: accessToken,
  }

  if (testEventCode) {
    body.test_event_code = testEventCode
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()
    return { success: response.ok, result }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// Send event to Google Analytics (Measurement Protocol)
async function sendToGoogle(
  measurementId: string,
  apiSecret: string,
  event: TrackEventRequest,
  clientId?: string
) {
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`
  
  const params: Record<string, any> = {}
  
  if (event.customData) {
    if (event.customData.value) params.value = event.customData.value
    if (event.customData.currency) params.currency = event.customData.currency
    if (event.customData.contentName) params.item_name = event.customData.contentName
    if (event.customData.orderId) params.transaction_id = event.customData.orderId
  }

  const body = {
    client_id: clientId || `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`,
    events: [{
      name: event.eventName,
      params,
    }],
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    return { success: response.ok }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// Send event to TikTok Events API
async function sendToTikTok(
  pixelId: string,
  accessToken: string,
  event: TrackEventRequest
) {
  const url = "https://business-api.tiktok.com/open_api/v1.3/pixel/track/"
  
  const properties: Record<string, any> = {}
  
  if (event.customData) {
    if (event.customData.value) properties.value = event.customData.value
    if (event.customData.currency) properties.currency = event.customData.currency
    if (event.customData.contentName) properties.content_name = event.customData.contentName
    if (event.customData.contentIds) properties.content_id = event.customData.contentIds.join(",")
    if (event.customData.orderId) properties.order_id = event.customData.orderId
  }

  const userData: Record<string, string> = {}
  
  if (event.userData) {
    if (event.userData.email) {
      userData.email = await hashData(event.userData.email)
    }
    if (event.userData.phone) {
      userData.phone_number = await hashData(event.userData.phone.replace(/\D/g, ""))
    }
    if (event.userData.externalId) {
      userData.external_id = event.userData.externalId
    }
  }

  const body = {
    pixel_code: pixelId,
    event: event.eventName,
    event_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    context: {
      user_agent: event.userData?.clientUserAgent,
      ip: event.userData?.clientIpAddress,
      page: {
        url: event.eventSourceUrl,
      },
      user: userData,
    },
    properties,
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()
    return { success: response.ok, result }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TrackEventRequest & { pixels?: any[] }
    
    // Get IP and User Agent
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") || 
                     "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"
    
    // Add client info to user data
    body.userData = {
      ...body.userData,
      clientIpAddress: clientIp,
      clientUserAgent: userAgent,
    }

    // If pixels are provided in the request, use them
    // Otherwise, this endpoint can be called from the frontend which will handle pixel config
    const pixels = body.pixels || []
    
    const results: Record<string, any> = {}
    
    for (const pixel of pixels) {
      if (pixel.status !== "active") continue
      
      // Check if this event is enabled for this pixel
      const eventEnabled = pixel.events?.find((e: any) => e.name === body.eventName && e.enabled)
      if (!eventEnabled && pixel.events?.length > 0) continue
      
      switch (pixel.type) {
        case "facebook":
          if (pixel.pixelId && pixel.accessToken) {
            results[pixel.id] = await sendToFacebook(
              pixel.pixelId,
              pixel.accessToken,
              body,
              pixel.testEventCode
            )
          }
          break
          
        case "google":
          if (pixel.pixelId && pixel.accessToken) {
            results[pixel.id] = await sendToGoogle(
              pixel.pixelId,
              pixel.accessToken,
              body
            )
          }
          break
          
        case "tiktok":
          if (pixel.pixelId && pixel.accessToken) {
            results[pixel.id] = await sendToTikTok(
              pixel.pixelId,
              pixel.accessToken,
              body
            )
          }
          break
      }
    }

    return NextResponse.json({
      success: true,
      event: body.eventName,
      results,
    })
  } catch (error) {
    console.error("Error tracking event:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve tracking script
export async function GET() {
  const script = `
// ScalaZap Pixel Tracking Script
(function() {
  window.scalazapTrack = function(eventName, userData, customData) {
    fetch('/api/pixels/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: eventName,
        userData: userData || {},
        customData: customData || {},
        eventSourceUrl: window.location.href,
        actionSource: 'website'
      })
    }).catch(console.error);
  };
  
  // Auto-track PageView
  window.scalazapTrack('PageView');
})();
`

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
    },
  })
}
