from pydantic import BaseModel
class ItemCreate(BaseModel):
    title:str
    description:str
    tag:str
    image_url:str
    link:str
    