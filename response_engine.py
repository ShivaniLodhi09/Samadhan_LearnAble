"""Adapt study replies based on detected emotion labels."""

from dataclasses import dataclass

from sentiment import EMOTION_LABELS


@dataclass(frozen=True)
class StudyReply:
    emotion: str
    tone: str
    opening: str
    guidance: str
    suggestion: str

    def format(self) -> str:
        return "\n\n".join([self.opening, self.guidance, f"Next step: {self.suggestion}"])


_STRATEGIES: dict[str, dict[str, str]] = {
    "anger": {
        "tone": "calming",
        "opening": (
            "Frustration often means you care about getting this right. "
            "Let's reset before pushing harder."
        ),
        "guidance": (
            "Step away for five minutes, then return with one specific question about {topic}. "
            "Anger usually fades once the problem feels smaller and concrete."
        ),
        "suggestion": (
            "Write down exactly what is blocking you in one sentence, "
            "then tackle only that piece."
        ),
    },
    "disgust": {
        "tone": "reframing",
        "opening": (
            "When a subject feels off-putting, motivation drops fast. "
            "That reaction is worth noticing."
        ),
        "guidance": (
            "Look for one practical reason {topic} matters to a goal you do care about. "
            "A small sense of purpose can make the material easier to engage with."
        ),
        "suggestion": (
            "Find a short real-world example of {topic} in action, "
            "then summarize it in three bullet points."
        ),
    },
    "fear": {
        "tone": "reassuring",
        "opening": (
            "Anxiety before studying is common, especially when the material feels high-stakes."
        ),
        "guidance": (
            "Lower the pressure: treat this as practice, not a final test. "
            "Start with something easy in {topic} to rebuild confidence."
        ),
        "suggestion": (
            "Do one low-stakes review task, like flashcards or a single worked example, "
            "and stop after a small win."
        ),
    },
    "joy": {
        "tone": "encouraging",
        "opening": "Great energy - you are in a strong place to learn right now.",
        "guidance": (
            "Use this momentum on {topic} by going one step beyond what feels comfortable: "
            "apply the idea to a new problem or explain it to someone else."
        ),
        "suggestion": (
            "Try a challenge problem or teach the concept out loud without looking at your notes."
        ),
    },
    "neutral": {
        "tone": "clear",
        "opening": "Got it - let's work through this in a steady, structured way.",
        "guidance": (
            "Start with the core idea behind {topic}, then connect it to an example you already know. "
            "Linking new ideas to familiar ones makes them stick."
        ),
        "suggestion": (
            "Write a one-sentence summary of what you are studying, "
            "then answer one practice question."
        ),
    },
    "sadness": {
        "tone": "supportive",
        "opening": (
            "It sounds like studying feels heavy right now, and that is okay. "
            "You do not have to push through at full speed."
        ),
        "guidance": (
            "Choose a gentle pace with {topic}: one short session beats a long one when energy is low. "
            "Progress still counts even when it is small."
        ),
        "suggestion": (
            "Set a 10-minute timer, review one section, then decide whether to continue or rest."
        ),
    },
    "surprise": {
        "tone": "curious",
        "opening": (
            "Something unexpected caught your attention - that can be a great hook for learning."
        ),
        "guidance": (
            "Follow the surprise: ask why this part of {topic} seems strange or different from what you expected. "
            "Curiosity often points to the concept worth understanding next."
        ),
        "suggestion": (
            "Write down what surprised you and one question it raised, "
            "then look up or review just enough to answer that question."
        ),
    },
}


def study_response(emotion: str, topic: str = "your topic") -> StudyReply:
    """Return a study reply adapted to the given emotion label."""
    normalized = emotion.strip().lower()
    if normalized not in EMOTION_LABELS:
        normalized = "neutral"

    strategy = _STRATEGIES[normalized]
    topic_text = topic.strip() or "your topic"

    return StudyReply(
        emotion=normalized,
        tone=strategy["tone"],
        opening=strategy["opening"],
        guidance=strategy["guidance"].format(topic=topic_text),
        suggestion=strategy["suggestion"].format(topic=topic_text),
    )
