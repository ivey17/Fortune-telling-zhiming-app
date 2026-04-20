import os
import sys

# Add the backend directory to sys.path so Vercel can find the modules
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from backend.main import app
