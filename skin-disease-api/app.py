import tensorflow as tf
import numpy as np
from google.cloud import storage
from flask import Flask, request, jsonify
from PIL import Image
import io
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load TFLite model from Google Cloud Storage
def load_model(bucket_name, model_path):
    try:
        logger.info(f"Loading model from bucket: {bucket_name}, path: {model_path}")
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(model_path)
        model_data = blob.download_as_bytes()
        logger.info("Model downloaded successfully")

        interpreter = tf.lite.Interpreter(model_content=model_data)
        interpreter.allocate_tensors()
        logger.info("Model loaded successfully")
        return interpreter
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise

interpreter = None

@app.route("/predict", methods=["POST"])
def predict():
    global interpreter
    try:
        if not interpreter:
            interpreter = load_model("dermavision-model-bucket", "model_unquant.tflite")
        
        image_file = request.files.get("image")
        if not image_file:
            return jsonify({"error": "No image provided"}), 400

        # Open and preprocess the image
        image = Image.open(image_file)
        image = image.resize((224, 224))
        image_array = np.array(image)
        image_array = np.expand_dims(image_array, axis=0).astype(np.float32)
        image_array = image_array / 255.0

        # Run inference
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        interpreter.set_tensor(input_details[0]['index'], image_array)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])
        
        # Process results
        predicted_class_index = np.argmax(output_data, axis=1)[0]
        confidence = float(np.max(output_data))
        logger.info(f"Raw prediction: class_index={predicted_class_index}, confidence={confidence}")

        # Define classes
        classes = ['nv', 'mel', 'bkl', 'bcc', 'akiec', 'vasc', 'df']

        # Apply confidence threshold
        if confidence < 0.75:
            predicted_class = "normal"
            confidence = 1.0
        else:
            predicted_class = classes[predicted_class_index]
        
        response = {"prediction": predicted_class, "confidence": confidence}
        logger.info(f"Returning prediction: {response}")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)