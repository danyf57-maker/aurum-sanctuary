#!/usr/bin/env python3
"""
Firebase Service Account Base64 Encoder
========================================
Converts a Firebase service account JSON file to base64 encoding
for use in FIREBASE_SERVICE_ACCOUNT_KEY_B64 environment variable.

This prevents issues with JSON escaping, quotes, and newlines in
production environments like Vercel, Railway, etc.

Usage:
    python scripts/encode-service-account.py [path/to/serviceAccountKey.json]

If no path is provided, defaults to ./serviceAccountKey.json
"""

import base64
import json
import sys
import pathlib


def encode_service_account(file_path: str) -> str:
    """Encode service account JSON to base64."""
    path = pathlib.Path(file_path)
    
    if not path.exists():
        raise FileNotFoundError(f"❌ Service account file not found: {file_path}")
    
    # Read and validate JSON
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        
        # Validate required fields
        required_fields = ['type', 'project_id', 'private_key', 'client_email']
        missing = [f for f in required_fields if f not in data]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        
        if data['type'] != 'service_account':
            raise ValueError(f"Invalid type: {data['type']} (expected 'service_account')")
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON file: {e}")
    
    # Encode to base64
    raw_bytes = path.read_bytes()
    encoded = base64.b64encode(raw_bytes).decode('utf-8')
    
    return encoded


def main():
    # Determine file path
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = "serviceAccountKey.json"
    
    print(f"🔍 Looking for service account file: {file_path}")
    
    try:
        encoded = encode_service_account(file_path)
        
        print("\n✅ Success! Copy the base64 string below:\n")
        print("=" * 80)
        print(encoded)
        print("=" * 80)
        print("\n📋 Add this to your .env.local file:")
        print(f"FIREBASE_SERVICE_ACCOUNT_KEY_B64={encoded}")
        print("\n⚠️  Keep this value secret! Never commit it to git.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        print("\n💡 Tip: Download your service account key from:")
        print("   Firebase Console > Project Settings > Service Accounts > Generate New Private Key")
        sys.exit(1)


if __name__ == "__main__":
    main()
