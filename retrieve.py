from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from langchain_huggingface import HuggingFaceEmbeddings
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from ingestion import DocumentChunk


# Database configuration (same as ingestion.py)
DATABASE_URL = "iris://_SYSTEM:ISCDEMO@localhost:1972/USER"
engine = create_engine(DATABASE_URL, echo=False)

# Initialize embedding model (same as ingestion.py)
embedding_model = HuggingFaceEmbeddings(model_name='paraphrase-MiniLM-L6-v2')


def retrieve_top_chunks(query, top_k=10):
    """
    Retrieve and rerank top document chunks

    Args:
        query: Search query string
        top_k: Number of top results to return

    Returns:
        List of tuples containing (content, similarity_score)
    """
    with Session(engine) as session:
        # Get all chunks from database
        chunks = session.execute(
            select(
                DocumentChunk.chunk_id,
                DocumentChunk.content,
                DocumentChunk.embedding
            )
        ).fetchall()

        # Convert to numpy arrays for vector operations
        embeddings = np.array([chunk.embedding for chunk in chunks])
        contents = [chunk.content for chunk in chunks]

        # Get query embedding
        query_embedding = embedding_model.embed_documents([query])[0]

        # Calculate cosine similarity between query and all chunks
        similarities = cosine_similarity(
            [query_embedding],
            embeddings
        )[0]

        # Combine scores with content
        scored_chunks = list(zip(contents, similarities))

        # Sort by similarity score (descending)
        scored_chunks.sort(key=lambda x: x[1], reverse=True)

        # Return top k results
        return scored_chunks[:top_k]


def main():

    # You can modify this to take user input
    query = "patient with really high colesterol and blood pressure"
    top_k = 10

    print(f"Retrieving top {top_k} most relevant chunks...")
    results = retrieve_top_chunks(query, top_k)

    print("\nTop Results:")

    for i, (content, score) in enumerate(results, 1):
        print(f"\nResult #{i} (Score: {score:.4f}):")
        print(content)


if __name__ == "__main__":
    main()
