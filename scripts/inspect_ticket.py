#!/usr/bin/env python3
"""Dump all data for a specific RepairShopr ticket."""

import os, sys, json, requests

SUBDOMAIN = "thecomputerstore"
BASE_URL = f"https://{SUBDOMAIN}.repairshopr.com/api/v1"

api_key = os.environ.get("REPAIRSHOPR_API_KEY")
if not api_key:
    print("Set REPAIRSHOPR_API_KEY first")
    sys.exit(1)

ticket_number = sys.argv[1] if len(sys.argv) > 1 else "28829"

# Search by ticket number
resp = requests.get(f"{BASE_URL}/tickets", headers={"Authorization": api_key}, params={"number": ticket_number}, timeout=30)
data = resp.json()
tickets = data.get("tickets", [])

if not tickets:
    print(f"Ticket #{ticket_number} not found")
    sys.exit(1)

print(json.dumps(tickets[0], indent=2, default=str))
