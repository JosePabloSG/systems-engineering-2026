import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { timestamp } = await request.json()

    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!apiSecret || !uploadPreset) {
      return NextResponse.json(
        { error: 'Cloudinary configuration missing' },
        { status: 500 }
      )
    }

    const stringToSign = `timestamp=${timestamp}&upload_preset=${uploadPreset}${apiSecret}`
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex')

    return NextResponse.json({ signature, timestamp })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    )
  }
}
