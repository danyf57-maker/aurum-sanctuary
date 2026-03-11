#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def decode_link(raw: bytes) -> str:
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return raw.decode("latin1")


def extract_links(pdf_path: Path) -> list[str]:
    data = pdf_path.read_bytes()
    links: list[str] = []
    for match in re.finditer(rb"/URI \((.*?)\)", data):
        link = decode_link(match.group(1))
        if link not in links:
            links.append(link)
    return links


def main() -> int:
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("Usage: extract_pdf_links.py <file.pdf> [--json]", file=sys.stderr)
        return 1

    pdf_path = Path(sys.argv[1]).expanduser()
    output_json = len(sys.argv) == 3 and sys.argv[2] == "--json"

    if not pdf_path.exists():
        print(f"File not found: {pdf_path}", file=sys.stderr)
        return 1

    links = extract_links(pdf_path)

    if output_json:
        print(
            json.dumps(
                {
                    "source_file": str(pdf_path),
                    "link_count": len(links),
                    "links": links,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        for link in links:
            print(link)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
