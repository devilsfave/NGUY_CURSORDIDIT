import type { Condition } from './severityCalculator';

interface PredictionResult {
    prediction: Condition;
    confidence: number;
}

interface PredictionError {
    message: string;
    code: string;
    details?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function predictImage(file: File): Promise<PredictionResult> {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
        try {
            // Validation
            if (file.size > MAX_FILE_SIZE) {
                throw new Error('Image size must be less than 10MB');
            }

            if (!ALLOWED_TYPES.includes(file.type)) {
                throw new Error('Only JPEG, PNG and WebP images are supported');
            }

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/predict', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Prediction result:', result);

            if (!result.prediction || typeof result.confidence !== 'number') {
                console.error('Invalid API response:', result);
                throw new Error('Invalid response format from API');
            }

            return {
                prediction: result.prediction,
                confidence: result.confidence
            };

        } catch (error) {
            console.error(`Prediction attempt ${retries + 1} failed:`, error);
            retries++;
            
            if (retries === MAX_RETRIES) {
                throw error;
            }
            
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }

    throw new Error('Maximum retries exceeded');
}