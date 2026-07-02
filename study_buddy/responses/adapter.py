from dataclasses import dataclass

from study_buddy.sentiment.detector import SentimentLabel, SentimentResult


@dataclass(frozen=True)
class StudyResponse:
    tone: str
    opening: str
    guidance: str
    suggestion: str


class ResponseAdapter:
    """Maps detected sentiment to study-support strategies."""

    _STRATEGIES: dict[SentimentLabel, dict[str, str]] = {
        SentimentLabel.NEGATIVE: {
            "tone": "supportive",
            "opening": (
                "It sounds like this topic is wearing on you - that's completely normal "
                "when learning something new."
            ),
            "guidance": (
                "Let's break this into smaller steps. Focus on one concept at a time "
                "instead of trying to master everything at once."
            ),
            "suggestion": (
                "Try a 10-minute review session, then take a short break. "
                "Come back and explain the idea out loud in your own words."
            ),
        },
        SentimentLabel.NEUTRAL: {
            "tone": "clear",
            "opening": "Got it - let's work through this together.",
            "guidance": (
                "Start with the core idea, then connect it to an example you already know. "
                "Building links between concepts makes them stick."
            ),
            "suggestion": (
                "Write a one-sentence summary of what you're studying, "
                "then test yourself with a quick question."
            ),
        },
        SentimentLabel.POSITIVE: {
            "tone": "encouraging",
            "opening": "Great energy - you're in a good headspace to learn!",
            "guidance": (
                "Use this momentum to tackle something slightly harder: "
                "apply the concept to a new problem or teach it to someone else."
            ),
            "suggestion": (
                "Challenge yourself with a practice problem one level above your comfort zone, "
                "or explain the topic as if you're tutoring a friend."
            ),
        },
    }

    def adapt(self, sentiment: SentimentResult, topic: str = "your topic") -> StudyResponse:
        strategy = self._STRATEGIES[sentiment.label]
        return StudyResponse(
            tone=strategy["tone"],
            opening=strategy["opening"],
            guidance=strategy["guidance"].replace("this", topic) if topic != "your topic" else strategy["guidance"],
            suggestion=strategy["suggestion"],
        )
