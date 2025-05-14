from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import numpy as np
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model = YOLO('yolov8n.pt')

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.post("/analyze/pothole")
async def analyze_pothole(file: UploadFile = File(...)):
    """Analyze pothole image using YOLOv8 and GPT-4"""
    try:
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # YOLOv8 detection
        results = model(image)
        detections = results[0].boxes.data.tolist()
        
        # Process detections
        if len(detections) == 0:
            return {"message": "No potholes detected", "severity": "none"}
        
        # Calculate severity based on detection size
        max_area = 0
        for det in detections:
            width = det[2] - det[0]
            height = det[3] - det[1]
            area = width * height
            max_area = max(max_area, area)
        
        # Normalize area and determine severity
        image_area = image.size[0] * image.size[1]
        relative_size = max_area / image_area
        
        if relative_size < 0.1:
            severity = "low"
        elif relative_size < 0.3:
            severity = "medium"
        else:
            severity = "high"
            
        return {
            "message": f"Detected {len(detections)} pothole(s)",
            "severity": severity,
            "confidence": float(results[0].boxes.conf[0]),
            "bbox": detections[0][:4]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/description")
async def analyze_description(description: str):
    """Analyze description using GPT-4"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an AI assistant that analyzes pothole descriptions to determine severity and priority."},
                {"role": "user", "content": description}
            ],
            temperature=0.3,
            max_tokens=150
        )
        
        analysis = response.choices[0].message.content
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
