from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from sqlalchemy import Column, MetaData, create_engine
from sqlalchemy.sql.sqltypes import Integer, Text
from sqlalchemy_iris import IRISVector
from sqlalchemy.orm import declarative_base
import uuid

# Database configuration
DATABASE_URL = "iris://_SYSTEM:ISCDEMO@localhost:1972/USER"
engine = create_engine(DATABASE_URL, echo=False)
metadata = MetaData()
Base = declarative_base()


# Define database table for document chunks
class DocumentChunk(Base):
    __tablename__ = "docs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    chunk_id = Column(Text, unique=True)
    content = Column(Text)
    embedding = Column(IRISVector(item_type=float, max_items=384))


def initialize_database():
    """Initialize the database and create tables"""
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)


def load_and_chunk_documents(pdf_path):
    """Load and split PDF documents into chunks"""
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    text_splitter = CharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=100
    )

    return text_splitter.split_documents(documents)


def generate_embeddings():
    """Initialize the embedding model"""
    return HuggingFaceEmbeddings(model_name='paraphrase-MiniLM-L6-v2')


def store_chunks(chunks, embedding_model):
    """Store document chunks with embeddings in the database"""
    with engine.connect() as conn:
        for chunk in chunks:
            embedding = embedding_model.embed_documents(
                [chunk.page_content])[0]

            conn.execute(
                DocumentChunk.__table__.insert(),
                {
                    "chunk_id": str(uuid.uuid4()),
                    "content": chunk.page_content,
                    "embedding": embedding
                }
            )
        conn.commit()


def main():
    # Initialize database
    initialize_database()

    # Load and chunk documents
    chunks = load_and_chunk_documents("doc.pdf")

    # Initialize embedding model
    embedding_model = generate_embeddings()

    # Store chunks with embeddings
    store_chunks(chunks, embedding_model)

    print(f"Successfully stored {len(chunks)} document chunks in the database")


if __name__ == "__main__":
    main()
