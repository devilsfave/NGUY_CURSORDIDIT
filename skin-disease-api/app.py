import tensorflow as tf
import numpy as np
from google.cloud import storage
from flask import Flask, request, jsonify
from PIL import Image
import io

app = Flask(__name__)

# Load TFLite model from Google Cloud Storage
def load_model(bucket_name, model_path):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(model_path)
    model_data = blob.download_as_bytes()

    interpreter = tf.lite.Interpreter(model_content=model_data)
    interpreter.allocate_tensors()
    return interpreter

interpreter = None

@app.route("/predict", methods=["POST"])
def predict():
    global interpreter
    if not interpreter:
        # Load the model if not already loaded
        interpreter = load_model("dermavision-model-bucket", "model_unquant.tflite")
    
    image_file = request.files.get("image")
    if not image_file:
        return jsonify({"error": "No image provided"}), 400

    # Open the image file
    image = Image.open(image_file)
    
    # Preprocess the image
    image = image.resize((224, 224))
    image_array = np.array(image)
    image_array = np.expand_dims(image_array, axis=0).astype(np.float32)
    image_array = image_array / 255.0  # Normalize to [0,1]

    # Set up input and output details
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    # Run inference
    interpreter.set_tensor(input_details[0]['index'], image_array)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    
    # Process the output
    predicted_class = np.argmax(output_data, axis=1)[0]
    classes = ['nv', 'mel', 'bkl', 'bcc', 'akiec', 'vasc', 'df']
    
    return jsonify({"prediction": classes[predicted_class]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)