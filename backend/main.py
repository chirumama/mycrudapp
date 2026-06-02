from fastapi import FastAPI,Depends
from sqlalchemy.orm import Session
from database import SessionLocal,engine
import models
import schemas
from fastapi.middleware.cors import CORSMiddleware


app=FastAPI()

models.Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    
    allow_credentials=True,           
    allow_methods=["*"],              
    allow_headers=["*"],              
)

def get_db():
    db=SessionLocal()
    try:
        yield db #what does yield do "yeild is generator function"
    finally:
        db.close()

@app.get("/items")
def get_items(db: Session=Depends(get_db)):
    return db.query(models.Item).all()

@app.post("/items")
def create_item(item : schemas.ItemCreate,db :Session=Depends(get_db)):
    db_item=models.Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.put("/items/{item_id}")
def update_items(item_id: int,
                 updated_item: schemas.ItemCreate,db:Session=Depends(get_db)):
    item=db.query(models.Item).filter(models.Item.id==item_id).first()
    item.title=updated_item.title
    item.description=updated_item.description
    item.tag=updated_item.tag
    item.image_url=updated_item.image_url
    item.link=updated_item.link
    db.commit()
    return item

@app.delete("/items/{item_id}")
def delete_item(item_id: int,
                db:Session=Depends(get_db)):
    item=db.query(models.Item).filter(models.Item.id==item_id).first()
    db.delete(item)
    db.commit()
    return {"message":"Item deleted"}



    



