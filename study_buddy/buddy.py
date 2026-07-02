from dataclasses import dataclass

from study_buddy.responses.adapter import ResponseAdapter, StudyResponse
from study_buddy.sentiment.detector import SentimentDetector, SentimentResult


@dataclass
class BuddySession:
    message: str
    topic: str
    sentiment: SentimentResult
    response: StudyResponse


class StudyBuddy:
    """Orchestrates sentiment detection and adaptive study responses."""

    def __init__(self) -> None:
        self._detector = SentimentDetector()
        self._adapter = ResponseAdapter()

    def respond(self, message: str, topic: str = "your topic") -> BuddySession:
        sentiment = self._detector.analyze(message)
        response = self._adapter.adapt(sentiment, topic=topic)
        return BuddySession(
            message=message,
            topic=topic,
            sentiment=sentiment,
            response=response,
        )

    def format_response(self, session: BuddySession) -> str:
        s = session.sentiment
        r = session.response
        lines = [
            f"Detected sentiment: {s.label.value} (score: {s.compound_score:+.2f})",
            f"Tone: {r.tone}",
            "",
            r.opening,
            "",
            r.guidance,
            "",
            f"Next step: {r.suggestion}",
        ]
        return "\n".join(lines)
