from fastapi import FastAPI

app = FastAPI()

'''
@app.post("/upload")
async def upload_docs(file_path: str):
    return await upload_documents(file_path)

@app.get("/query")
async def query_docs(query: str):
    return await query_documents(query)
'''