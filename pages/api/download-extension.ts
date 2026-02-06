import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'public', 'screengrabber-extension-v2.3.0.zip')
  
  try {
    const fileBuffer = fs.readFileSync(filePath)
    
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', 'attachment; filename=screengrabber-extension-v2.3.0.zip')
    res.setHeader('Content-Length', fileBuffer.length)
    
    res.status(200).send(fileBuffer)
  } catch (error) {
    console.error('Error serving file:', error)
    res.status(404).json({ error: 'File not found' })
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
}
