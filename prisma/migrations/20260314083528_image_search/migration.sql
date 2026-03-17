CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "ads" ADD COLUMN "imageEmbedding" vector(512);

CREATE INDEX "ads_embedding_idx" 
ON "ads" 
USING hnsw ("imageEmbedding" vector_cosine_ops);