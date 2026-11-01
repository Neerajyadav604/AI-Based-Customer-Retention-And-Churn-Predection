# photo.py - profile photo upload: browser -> FastAPI -> Cloudinary
import os
import hashlib
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from auth import current_user
from mongo import users

load_dotenv()

# The secret key stays on the server, it is never sent to the browser
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

router = APIRouter()
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"]
MAX_SIZE = 2 * 1024 * 1024  # 2 MB


@router.post("/auth/photo")
def upload_photo(file: UploadFile = File(...), user=Depends(current_user)):
    # 1. Only JPG, PNG or GIF
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG or GIF images are allowed")

    # 2. Read at most 2 MB + 1 byte, so a huge file is never fully loaded
    data = file.file.read(MAX_SIZE + 1)
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Image must be 2MB or smaller")

    # 3. One fixed name per user, so a new photo replaces the old one
    name = hashlib.sha256(user["email"].encode()).hexdigest()[:16]
    try:
        result = cloudinary.uploader.upload(
            data, folder="churnguard-profiles", public_id=name,
            overwrite=True, invalidate=True, resource_type="image",
        )
    except Exception as e:
        print("Photo upload failed:", type(e).__name__)  # error type only, no secrets
        raise HTTPException(status_code=502, detail="Photo upload failed, try again")

    # 4. Save the link on the user in MongoDB and return it
    url = result["secure_url"]
    users.update_one({"email": user["email"]}, {"$set": {"photo_url": url}})
    return {"photo_url": url}