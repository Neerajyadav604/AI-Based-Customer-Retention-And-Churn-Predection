"""
intent_engine.py - Modernized Intent Recognition and Conversation Management.
Inspired by the core concepts of Tensorflow-Chatbot (nimeshabuddhika/Tensorflow-Chatbot):
- Intent catalog with tags, patterns, responses, context_set, and context_filter
- Tokenization, text cleaning, and Bag-of-Words similarity matching
- Stateful per-session conversation context flow
- Safe fallback when confidence is below threshold
"""

import os
import re
import json
import random
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

INTENTS_FILE = Path(__file__).resolve().parent / "intents.json"

# In-memory session context storage: { session_id_or_user: "active_context_tag" }
SESSION_CONTEXT: Dict[str, str] = {}


class ModernIntentEngine:
    """
    Lightweight, deterministic NLP Intent Classifier and Conversation Context Manager.
    Does not require outdated TensorFlow/TFLearn dependencies.
    """

    def __init__(self, intents_path: Path = INTENTS_FILE):
        self.intents_path = intents_path
        self.intents: List[Dict[str, Any]] = []
        self.vocabulary: List[str] = []
        self.load_intents()

    def load_intents(self):
        """Load intents from JSON configuration."""
        if self.intents_path.exists():
            with open(self.intents_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.intents = data.get("intents", [])
        else:
            self.intents = []

        # Build vocabulary from all pattern words
        words = set()
        for item in self.intents:
            for pattern in item.get("patterns", []):
                for token in self.clean_up_sentence(pattern):
                    words.add(token)
        self.vocabulary = sorted(list(words))

    @staticmethod
    def clean_up_sentence(sentence: str) -> List[str]:
        """
        Normalize sentence: lowercase, strip punctuation, tokenize and basic stemming.
        """
        cleaned = re.sub(r"[^\w\s]", " ", sentence.lower())
        tokens = cleaned.split()
        # Basic suffix stemming (s, ing, ed, tion, ment)
        stemmed = []
        for t in tokens:
            if len(t) > 4:
                if t.endswith("ing"):
                    t = t[:-3]
                elif t.endswith("tion"):
                    t = t[:-4]
                elif t.endswith("ment"):
                    t = t[:-4]
                elif t.endswith("es"):
                    t = t[:-2]
                elif t.endswith("s"):
                    t = t[:-1]
                elif t.endswith("ed"):
                    t = t[:-2]
            stemmed.append(t)
        return stemmed

    def bow(self, sentence: str) -> Dict[str, int]:
        """Create bag-of-words token count dictionary."""
        tokens = self.clean_up_sentence(sentence)
        counts = {}
        for t in tokens:
            counts[t] = counts.get(t, 0) + 1
        return counts

    def match_intent(
        self,
        sentence: str,
        session_id: str = "default",
        threshold: float = 0.35,
    ) -> Optional[Tuple[Dict[str, Any], float]]:
        """
        Classify sentence into the highest confidence intent matching the current conversation context.
        Returns (intent_dict, confidence_score) or None if below threshold.
        """
        input_tokens = set(self.clean_up_sentence(sentence))
        if not input_tokens:
            return None

        current_context = SESSION_CONTEXT.get(session_id, "")
        best_intent = None
        best_score = 0.0

        for item in self.intents:
            # Check context_filter if specified
            context_filter = item.get("context_filter")
            if context_filter and context_filter != current_context:
                continue

            for pattern in item.get("patterns", []):
                pattern_tokens = set(self.clean_up_sentence(pattern))
                if not pattern_tokens:
                    continue

                # Jaccard / Overlap similarity score
                intersection = input_tokens.intersection(pattern_tokens)
                union = input_tokens.union(pattern_tokens)
                jaccard = len(intersection) / len(union) if union else 0.0

                # Exact phrase match bonus
                pattern_clean = " ".join(self.clean_up_sentence(pattern))
                sentence_clean = " ".join(self.clean_up_sentence(sentence))
                if pattern_clean in sentence_clean or sentence_clean in pattern_clean:
                    jaccard = max(jaccard, 0.85)

                if jaccard > best_score:
                    best_score = jaccard
                    best_intent = item

        if best_score >= threshold and best_intent:
            # Update session context if context_set is specified
            context_set = best_intent.get("context_set")
            if context_set:
                SESSION_CONTEXT[session_id] = context_set
            elif context_set == "":
                SESSION_CONTEXT.pop(session_id, None)

            return best_intent, best_score

        return None

    def get_response(self, sentence: str, session_id: str = "default") -> Optional[str]:
        """
        Return a response for the sentence if an intent matches with high confidence.
        """
        match = self.match_intent(sentence, session_id=session_id)
        if match:
            intent, score = match
            responses = intent.get("responses", [])
            if responses:
                return random.choice(responses)
        return None


# Global singleton instance
intent_engine = ModernIntentEngine()
