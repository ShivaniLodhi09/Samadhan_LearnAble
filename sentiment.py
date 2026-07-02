"""Emotion classification from text using Hugging Face transformers."""

from dataclasses import dataclass
from functools import lru_cache

from transformers import pipeline

DEFAULT_MODEL = "j-hartmann/emotion-english-distilroberta-base"

EMOTION_LABELS = (
    "anger",
    "disgust",
    "fear",
    "joy",
    "neutral",
    "sadness",
    "surprise",
)


@dataclass(frozen=True)
class EmotionResult:
    emotion: str
    confidence: float
    scores: dict[str, float]


@lru_cache(maxsize=1)
def _get_classifier(model_name: str = DEFAULT_MODEL):
    return pipeline("text-classification", model=model_name, top_k=None)


def detect_emotion(text: str, model_name: str = DEFAULT_MODEL) -> EmotionResult:
    """Classify the dominant emotion in *text*.

    Returns an :class:`EmotionResult` with the top emotion, its confidence,
    and scores for every label the model supports.
    """
    if not text or not text.strip():
        return EmotionResult(
            emotion="neutral",
            confidence=1.0,
            scores={"neutral": 1.0},
        )

    predictions = _get_classifier(model_name)(text.strip())
    scores = {item["label"].lower(): item["score"] for item in predictions[0]}
    emotion = max(scores, key=scores.get)
    return EmotionResult(
        emotion=emotion,
        confidence=scores[emotion],
        scores=scores,
    )
