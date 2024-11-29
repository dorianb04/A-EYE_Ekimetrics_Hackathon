# A-Eye: AI Vision Analysis

## Overview

**A-Eye** is an innovative vision assistant designed to enhance the independence of visually impaired individuals. Built during the **Consumer Edge AI Hackathon** (organized by **Entrepreneur First**, **Meta**, **Hugging Face**, **PyTorch**, and **Scaleway**), this solution provides real-time visual assistance through natural voice interactions.

## Key Features

- **Real-time Obstacle Detection**: Alerts users about obstacles and moving objects in their path
- **Menu Reading**: Reads and describes restaurant menus in multiple languages
- **Navigation Assistance**: Helps with street navigation by reading signs and describing surroundings
- **Offline Capability**: Functions without internet connectivity
- **Natural Voice Interaction**: Speech-to-Speech interface for intuitive use

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Git

## Installation

Clone the repository:

```bash
git clone https://github.com/Othocs/A-EYE_Ekimetrics_Hackathon
cd A-EYE_Ekimetrics_Hackathon
```

## Setup and Running
### Adding api key

The various services used in the project require API keys. These keys are stored in a `config.yaml` file in the `backend/` directory. You will need to add your own keys to this file.

to do so, create a `config.yaml` file in the `backend/` directory

```bash
cp backend/config.yaml.example backend/config.yaml
```

Then, add your own keys to the `config.yaml` file
```yaml
backend:
  mode: "groq"
  groq_api:
    api_key: your_groq_api_key
    vllm_model_name: "llama-3.2-90b-vision-preview"
    transcript_model_name: "whisper-large-v3-turbo"
  scaleway_vllm_api:
    base_url: https://api.scaleway.ai/v1
    api_key: your_scaleway_api_key
    vllm_model_name: "pixtral-12b-2409"
  transcript_model:
    version: "tiny"
```

### Backend server

1. Install Pyhon dependencies and run the server:
```bash
cd backend
pip install -r requirements.txt
cd server
python server.py
```
The server should start running on `http://localhost:5000` by default.

### Frontend application

1. Install Node.js dependencies and run the application:
```bash
cd frontend
npm install
npm start
```

The application should open automatically in your default browser at http://localhost:3000.

## Configuration
The Flask server URL is configured in `.env`. Ensure it matches your backend server address.

Default configuration assumes the backend runs on `http://localhost:5000`.

## Risk of troubleshooting

If you encounter CORS issues, verify that the Flask server URL called by `App.js` matches your backend server address.

Ensure all required ports (3000 for React, 5000 for Flask) are available and not blocked by firewall.

Check that all dependencies are correctly installed by running `npm install` and `pip install -r requirements.txt` again.
