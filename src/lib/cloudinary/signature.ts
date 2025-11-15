/**
 * Signature Service
 * Single Responsibility: Handle signature generation for signed uploads
 */

interface SignatureResponse {
  signature: string
  timestamp: number
}

/**
 * Get signature for signed uploads from API
 */
export async function getUploadSignature(timestamp: number): Promise<SignatureResponse> {
  const response = await fetch('/api/cloudinary/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timestamp }),
  })

  if (!response.ok) {
    throw new Error('Failed to get upload signature')
  }

  return response.json()
}
