import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CLOUDINARY_API_SECRET = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET!
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!

export async function POST(request: NextRequest) {
  try {
    const { publicId, resourceType = 'image' } = await request.json()

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      )
    }

    // Generate timestamp
    const timestamp = Math.round(Date.now() / 1000)

    // Create signature string - MUST be alphabetically sorted
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`
    
    // Generate SHA-1 signature
    const signature = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex')

    // Call Cloudinary destroy API
    const formData = new URLSearchParams()
    formData.append('public_id', publicId)
    formData.append('signature', signature)
    formData.append('api_key', CLOUDINARY_API_KEY)
    formData.append('timestamp', timestamp.toString())

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    )

    const result = await response.json()

    if (!response.ok || result.result !== 'ok') {
      console.error('Cloudinary delete error:', result)
      return NextResponse.json(
        { error: result.error?.message || 'Failed to delete from Cloudinary' },
        { status: response.status }
      )
    }

    return NextResponse.json({ result: result.result })
  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
