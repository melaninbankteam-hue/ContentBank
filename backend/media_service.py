import cloudinary
import cloudinary.uploader
import os
from typing import Optional, Dict, Any

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

class MediaService:
    @staticmethod
    def upload_image(file_data: bytes, filename: str, folder: str = "content_planner") -> Dict[str, Any]:
        """Upload image to Cloudinary"""
        try:
            result = cloudinary.uploader.upload(
                file_data,
                folder=folder,
                public_id=filename,
                overwrite=True,
                resource_type="auto"
            )
            return {
                "success": True,
                "url": result['secure_url'],
                "public_id": result['public_id'],
                "width": result.get('width'),
                "height": result.get('height')
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def delete_image(public_id: str) -> Dict[str, Any]:
        """Delete image from Cloudinary"""
        try:
            result = cloudinary.uploader.destroy(public_id)
            return {
                "success": result['result'] == 'ok',
                "result": result['result']
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }