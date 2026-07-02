#!/usr/bin/env python3
"""Interactive CLI for the Sentiment Aware Study Buddy."""

import argparse
import sys

from study_buddy.buddy import StudyBuddy


def run_interactive(topic: str) -> None:
    buddy = StudyBuddy()
    print("Sentiment Aware Study Buddy")
    print("Share how you're feeling about your studies. Type 'quit' to exit.\n")

    while True:
        try:
            message = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGood luck with your studies!")
            break

        if not message:
            continue
        if message.lower() in {"quit", "exit", "q"}:
            print("Good luck with your studies!")
            break

        session = buddy.respond(message, topic=topic)
        print(f"\nBuddy:\n{buddy.format_response(session)}\n")


def run_once(message: str, topic: str) -> None:
    buddy = StudyBuddy()
    session = buddy.respond(message, topic=topic)
    print(buddy.format_response(session))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Detect learner sentiment and adapt study responses."
    )
    parser.add_argument(
        "-m",
        "--message",
        help="Single message to analyze (skips interactive mode).",
    )
    parser.add_argument(
        "-t",
        "--topic",
        default="your topic",
        help="Study topic for tailored guidance (default: 'your topic').",
    )
    args = parser.parse_args()

    if args.message:
        run_once(args.message, args.topic)
    else:
        run_interactive(args.topic)


if __name__ == "__main__":
    main()
