export async function predictImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
  
    const response = await fetch('/api/predict', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error('Prediction failed');
    }
  
    return await response.json();
  }