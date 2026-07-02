from dataclasses import dataclass
from enum import Enum

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


@dataclass(frozen=True)
class SentimentResult:
    label: SentimentLabel
    compound_score: float
    positive: float
    neutral: float
    negative: float


class SentimentDetector:
    """Detects learner sentiment from free-text input using VADER."""

    def __init__(self) -> None:
        self._analyzer = SentimentIntensityAnalyzer()

    def analyze(self, text: str) -> SentimentResult:
        if not text or not text.strip():
            return SentimentResult(
                label=SentimentLabel.NEUTRAL,
                compound_score=0.0,
                positive=0.0,
                neutral=1.0,
                negative=0.0,
            )

        scores = self._analyzer.polarity_scores(text.strip())
        compound = scores["compound"]

        if compound >= 0.05:
            label = SentimentLabel.POSITIVE
        elif compound <= -0.05:
            label = SentimentLabel.NEGATIVE
        else:
            label = SentimentLabel.NEUTRAL

        return SentimentResult(
            label=label,
            compound_score=compound,
            positive=scores["pos"],
            neutral=scores["neu"],
            negative=scores["neg"],
        )
