#!/usr/bin/env python3
"""
Data ingestion script for Alan Watts content
Scrapes, processes, and prepares data for RAG pipeline
"""

import json
import requests
from typing import List, Dict
import time
from pathlib import Path

class WattsDataIngester:
    def __init__(self, output_dir="./data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
    def fetch_archive_org_texts(self) -> List[Dict]:
        """Fetch Alan Watts texts from Archive.org"""
        print("Fetching texts from Archive.org...")
        
        # Search for Alan Watts texts
        search_url = "https://archive.org/advancedsearch.php"
        params = {
            'q': 'creator:"Alan Watts" AND mediatype:texts',
            'fl': 'identifier,title,description,year,downloads',
            'output': 'json',
            'rows': 50,
            'sort': 'downloads desc'
        }
        
        try:
            response = requests.get(search_url, params=params)
            data = response.json()
            
            texts = []
            for doc in data['response']['docs'][:10]:  # Limit to top 10 for testing
                identifier = doc['identifier']
                print(f"  Processing: {doc.get('title', identifier)}")
                
                # Try to get text content
                text_url = f"https://archive.org/stream/{identifier}/{identifier}_djvu.txt"
                try:
                    text_response = requests.get(text_url, timeout=30)
                    if text_response.status_code == 200:
                        texts.append({
                            'id': identifier,
                            'title': doc.get('title', ''),
                            'year': doc.get('year', ''),
                            'description': doc.get('description', ''),
                            'content': text_response.text[:100000],  # Limit size for testing
                            'source': f"https://archive.org/details/{identifier}",
                            'type': 'book'
                        })
                        time.sleep(1)  # Be polite to the server
                except Exception as e:
                    print(f"    Error fetching text: {e}")
                    
            return texts
            
        except Exception as e:
            print(f"Error searching Archive.org: {e}")
            return []
    
    def fetch_wikiquote(self) -> List[Dict]:
        """Fetch Alan Watts quotes from Wikiquote"""
        print("Fetching quotes from Wikiquote...")
        
        url = "https://en.wikiquote.org/w/api.php"
        params = {
            'action': 'parse',
            'page': 'Alan_Watts',
            'format': 'json',
            'prop': 'text'
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if 'parse' in data:
                html_content = data['parse']['text']['*']
                # Simple extraction - in production, use BeautifulSoup
                return [{
                    'id': 'wikiquote_watts',
                    'title': 'Alan Watts Quotes Collection',
                    'content': html_content,
                    'source': 'https://en.wikiquote.org/wiki/Alan_Watts',
                    'type': 'quotes'
                }]
        except Exception as e:
            print(f"Error fetching Wikiquote: {e}")
            
        return []
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
        """Split text into overlapping chunks"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to end at a sentence boundary
            if end < len(text):
                last_period = chunk.rfind('. ')
                if last_period > chunk_size * 0.7:
                    end = start + last_period + 2
                    chunk = text[start:end]
            
            chunks.append(chunk.strip())
            start = end - overlap
            
        return chunks
    
    def process_for_rag(self, documents: List[Dict]) -> List[Dict]:
        """Process documents into chunks ready for embedding"""
        print("\nProcessing documents for RAG...")
        
        all_chunks = []
        
        for doc in documents:
            if not doc.get('content'):
                continue
                
            # Clean text
            content = doc['content']
            content = ' '.join(content.split())  # Normalize whitespace
            
            # Create chunks
            chunks = self.chunk_text(content)
            
            for i, chunk in enumerate(chunks):
                chunk_doc = {
                    'id': f"{doc['id']}_chunk_{i}",
                    'text': chunk,
                    'metadata': {
                        'source_id': doc['id'],
                        'title': doc.get('title', ''),
                        'source_url': doc.get('source', ''),
                        'type': doc.get('type', ''),
                        'chunk_index': i,
                        'total_chunks': len(chunks)
                    }
                }
                all_chunks.append(chunk_doc)
        
        print(f"Created {len(all_chunks)} chunks from {len(documents)} documents")
        return all_chunks
    
    def save_data(self, data: List[Dict], filename: str):
        """Save data to JSON file"""
        filepath = self.output_dir / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Saved to {filepath}")
    
    def run(self):
        """Run the complete ingestion pipeline"""
        print("Starting Alan Watts data ingestion...")
        
        # Collect raw documents
        documents = []
        
        # Fetch from various sources
        archive_texts = self.fetch_archive_org_texts()
        documents.extend(archive_texts)
        
        wikiquote = self.fetch_wikiquote()
        documents.extend(wikiquote)
        
        # Save raw documents
        self.save_data(documents, 'raw_documents.json')
        
        # Process for RAG
        chunks = self.process_for_rag(documents)
        self.save_data(chunks, 'rag_chunks.json')
        
        # Create summary
        summary = {
            'total_documents': len(documents),
            'total_chunks': len(chunks),
            'sources': {
                'archive_org': len(archive_texts),
                'wikiquote': len(wikiquote)
            },
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        self.save_data([summary], 'ingestion_summary.json')
        
        print("\nIngestion complete!")
        print(f"  Documents: {len(documents)}")
        print(f"  Chunks: {len(chunks)}")
        print(f"  Output directory: {self.output_dir.absolute()}")

if __name__ == "__main__":
    ingester = WattsDataIngester()
    ingester.run()