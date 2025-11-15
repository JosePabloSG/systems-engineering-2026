
 export interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  format: string
  resource_type: 'image' | 'video'
  width: number
  height: number
  bytes: number
}

export interface CloudinaryError {
  message: string
  http_code?: number
}