import logging
import threading

logger = logging.getLogger(__name__)

class MLModels:
    """Singleton for loading ML models safely on startup with robust fallbacks."""
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLModels, cls).__new__(cls)
            cls._instance.sbert = None
            cls._instance.nlp = None
            cls._instance.analyzer = None
            cls._instance.loaded = False
        return cls._instance

    def load_models(self):
        with self._lock:
            if not self.loaded:
                # 1. Try loading SentenceTransformer
                try:
                    from sentence_transformers import SentenceTransformer
                    logger.info("Loading SentenceTransformer (all-MiniLM-L6-v2)...")
                    self.sbert = SentenceTransformer('all-MiniLM-L6-v2')
                except Exception as e:
                    logger.warning(f"SentenceTransformer optional load skipped: {e}")
                    self.sbert = None
                
                # 2. Try loading spaCy
                try:
                    import spacy
                    logger.info("Loading spaCy model...")
                    try:
                        self.nlp = spacy.load("en_core_web_md")
                    except OSError:
                        try:
                            self.nlp = spacy.load("en_core_web_sm")
                        except OSError:
                            from spacy.cli import download
                            download("en_core_web_sm")
                            self.nlp = spacy.load("en_core_web_sm")
                except Exception as e:
                    logger.warning(f"spaCy model optional load skipped: {e}")
                    self.nlp = None

                # 3. Try loading VADER Sentiment Analyzer
                try:
                    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
                    logger.info("Loading VADER Sentiment Analyzer...")
                    self.analyzer = SentimentIntensityAnalyzer()
                except Exception as e:
                    logger.warning(f"VADER Sentiment Analyzer load error: {e}")
                    self.analyzer = None
                    
                self.loaded = True
                logger.info("ML Models initialized (with available backends).")

ml_models = MLModels()
