import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import FormData from 'form-data'
import { IncomingForm, File, Files } from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface FormidableFiles extends Files {
  image?: File[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const form = new IncomingForm()
    const [fields, files] = await new Promise<[any, FormidableFiles]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve([fields, files as FormidableFiles])
      })
    })

    const formData = new FormData()
    const file = files.image?.[0]
    if (!file) {
      throw new Error('No image file found in the request')
    }
    formData.append('image', fs.createReadStream(file.filepath), file.originalFilename || 'image.jpg')
    formData.append('description', 'image')

    const apiUrl = process.env.API_URL
    if (!apiUrl) {
      throw new Error('API URL is not defined in environment variables')
    }

    const response = await fetch(`${apiUrl}/predict`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error: unknown) {
    console.error('Error in predict API route:', error)
    if (error instanceof Error) {
      res.status(500).json({ message: 'Internal server error', error: error.message })
    } else {
      res.status(500).json({ message: 'Internal server error', error: 'An unknown error occurred' })
    }
  }
}