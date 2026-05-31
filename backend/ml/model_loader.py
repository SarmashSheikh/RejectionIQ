import logging
import spacy
from sentence_transformers import SentenceTransformer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

logger = logging.getLogger(__name__)

class MLModels:
    """Singleton for loading ML models exactly once on startup."""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLModels, cls).__new__(cls)
            cls._instance.sbert = None
            cls._instance.nlp = None
            cls._instance.analyzer = None
            cls._instance.loaded = False
        return cls._instance

    def load_models(self):
        if not self.loaded:
            logger.info("Loading SentenceTransformer (all-MiniLM-L6-v2)...")
            self.sbert = SentenceTransformer('all-MiniLM-L6-v2')
            
            logger.info("Loading spaCy en_core_web_md...")
            try:
                self.nlp = spacy.load("en_core_web_md")
            except OSError:
                logger.warning("spaCy model not found. Downloading...")
                from spacy.cli import download
                download("en_core_web_md")
                self.nlp = spacy.load("en_core_web_md")
                
            logger.info("Loading VADER Sentiment Analyzer...")
            self.analyzer = SentimentIntensityAnalyzer()
                
            self.loaded = True
            logger.info("All ML Models loaded successfully.")

ml_models = MLModels()
