import { NextResponse } from 'next/server';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create node-fetch compatible FormData
    const apiFormData = new FormData();
    apiFormData.append('image', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    // Add error handling for API_URL
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      throw new Error('API_URL environment variable is not set');
    }

    // Make request to ML API with timeout and retry
    const response = await fetch(`${apiUrl}/predict`, {
      method: 'POST',
      headers: {
        ...apiFormData.getHeaders(),
      },
      // @ts-ignore
      body: apiFormData,
      timeout: 60000 // Increase timeout to 60 seconds
    }).catch(error => {
      console.error('Fetch error:', error);
      throw new Error(`API request failed: ${error.message}`);
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ML API Error Response:', errorText);
      
      // Return a more specific error
      return NextResponse.json({
        error: 'Failed to process image. Please try again.',
        details: `API Status: ${response.status}`,
      }, { status: 500 });
    }

    const result = await response.json();
    
    // Validate response format
    if (!result.prediction || typeof result.confidence !== 'number') {
      throw new Error('Invalid response format from ML API');
    }

    return NextResponse.json({
      success: true,
      prediction: result.prediction,
      confidence: result.confidence
    });

  } catch (error) {
    console.error('Prediction error:', error);
    
    // More detailed error response
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process image',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}