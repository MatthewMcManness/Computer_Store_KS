#!/usr/bin/env python3
"""
RepairShopr Bulk Location Update Script

Updates all existing tickets and invoices to use the Topeka location (ID: 3311).
Run with --test first to verify on a single record, then --run for all.

Usage:
    python3 update_locations.py --test    # Update one ticket and one invoice
    python3 update_locations.py --run     # Update all remaining records

Environment:
    REPAIRSHOPR_API_KEY - Your RepairShopr API token
"""

import os
import sys
import time
import requests

# Configuration
SUBDOMAIN = "thecomputerstore"
BASE_URL = f"https://{SUBDOMAIN}.repairshopr.com/api/v1"
TOPEKA_LOCATION_ID = 3311

# Rate limiting: RepairShopr allows ~180 requests/minute
REQUEST_DELAY = 0.35  # seconds between requests


def get_api_key() -> str:
    """Get API key from environment variable."""
    api_key = os.environ.get("REPAIRSHOPR_API_KEY")
    if not api_key:
        print("Error: REPAIRSHOPR_API_KEY environment variable not set.")
        print("\nSet it with:")
        print("  export REPAIRSHOPR_API_KEY='your-api-key-here'")
        sys.exit(1)
    return api_key


def make_request(method: str, endpoint: str, api_key: str, data: dict = None, retries: int = 3) -> dict:
    """Make an API request to RepairShopr with retry logic."""
    url = f"{BASE_URL}/{endpoint}"
    headers = {"Authorization": api_key}

    for attempt in range(retries):
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            if response.status_code == 429:
                print("Rate limited. Waiting 60 seconds...")
                time.sleep(60)
                continue

            response.raise_for_status()
            return response.json()

        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            if attempt < retries - 1:
                wait_time = (attempt + 1) * 10  # 10s, 20s, 30s
                print(f"\n  Connection error, retrying in {wait_time}s... ", end="")
                time.sleep(wait_time)
            else:
                raise

    return {}


def get_all_tickets(api_key: str) -> list:
    """Fetch all tickets with pagination."""
    print("Fetching all tickets...")
    all_tickets = []
    page = 1

    while True:
        data = make_request("GET", "tickets", api_key, {"page": page, "per_page": 100})
        tickets = data.get("tickets", [])

        if not tickets:
            break

        all_tickets.extend(tickets)
        print(f"  Page {page}: {len(tickets)} tickets (total: {len(all_tickets)})")

        # Check if there are more pages
        meta = data.get("meta", {})
        total_pages = meta.get("total_pages", 1)
        if page >= total_pages:
            break

        page += 1
        time.sleep(REQUEST_DELAY)

    print(f"Total tickets: {len(all_tickets)}")
    return all_tickets


def get_all_invoices(api_key: str) -> list:
    """Fetch all invoices with pagination."""
    print("Fetching all invoices...")
    all_invoices = []
    page = 1

    while True:
        data = make_request("GET", "invoices", api_key, {"page": page, "per_page": 100})
        invoices = data.get("invoices", [])

        if not invoices:
            break

        all_invoices.extend(invoices)
        print(f"  Page {page}: {len(invoices)} invoices (total: {len(all_invoices)})")

        # Check if there are more pages
        meta = data.get("meta", {})
        total_pages = meta.get("total_pages", 1)
        if page >= total_pages:
            break

        page += 1
        time.sleep(REQUEST_DELAY)

    print(f"Total invoices: {len(all_invoices)}")
    return all_invoices


def update_ticket(api_key: str, ticket_id: int, location_id: int) -> bool:
    """Update a ticket's location."""
    try:
        make_request("PUT", f"tickets/{ticket_id}", api_key, {"location_id": location_id})
        return True
    except requests.exceptions.HTTPError as e:
        print(f"  Error updating ticket {ticket_id}: {e}")
        return False


def update_invoice(api_key: str, invoice_id: int, location_id: int) -> bool:
    """Update an invoice's location."""
    try:
        make_request("PUT", f"invoices/{invoice_id}", api_key, {"location_id": location_id})
        return True
    except requests.exceptions.HTTPError as e:
        print(f"  Error updating invoice {invoice_id}: {e}")
        return False


def run_test(api_key: str):
    """Test mode: update one ticket and one invoice."""
    print("\n" + "=" * 50)
    print("TEST MODE - Updating one ticket and one invoice")
    print(f"Target location_id: {TOPEKA_LOCATION_ID}")
    print("=" * 50)

    # Get tickets that need updating
    tickets = get_all_tickets(api_key)
    tickets_to_update = [t for t in tickets if t.get("location_id") != TOPEKA_LOCATION_ID]

    if tickets_to_update:
        ticket = tickets_to_update[0]
        print(f"\nUpdating ticket #{ticket['number']} (ID: {ticket['id']})...")
        print(f"  Current location_id: {ticket.get('location_id')}")

        if update_ticket(api_key, ticket["id"], TOPEKA_LOCATION_ID):
            print(f"  Success! Updated to location_id: {TOPEKA_LOCATION_ID}")
        else:
            print("  Failed to update ticket.")
    else:
        print(f"\nNo tickets need updating (all {len(tickets)} already have location_id {TOPEKA_LOCATION_ID})")

    # Get invoices that need updating
    invoices = get_all_invoices(api_key)
    invoices_to_update = [i for i in invoices if i.get("location_id") != TOPEKA_LOCATION_ID]

    if invoices_to_update:
        invoice = invoices_to_update[0]
        print(f"\nUpdating invoice #{invoice['number']} (ID: {invoice['id']})...")
        print(f"  Current location_id: {invoice.get('location_id')}")

        if update_invoice(api_key, invoice["id"], TOPEKA_LOCATION_ID):
            print(f"  Success! Updated to location_id: {TOPEKA_LOCATION_ID}")
        else:
            print("  Failed to update invoice.")
    else:
        print(f"\nNo invoices need updating (all {len(invoices)} already have location_id {TOPEKA_LOCATION_ID})")

    print("\n" + "=" * 50)
    print("TEST COMPLETE")
    print("Verify the changes in RepairShopr, then run with --run")
    print("=" * 50)


def run_bulk_update(api_key: str):
    """Bulk update all tickets and invoices."""
    print("\n" + "=" * 50)
    print("BULK UPDATE MODE - Updating all records")
    print(f"Target location_id: {TOPEKA_LOCATION_ID}")
    print("=" * 50)

    # Update tickets
    tickets = get_all_tickets(api_key)
    tickets_to_update = [t for t in tickets if t.get("location_id") != TOPEKA_LOCATION_ID]
    print(f"\nTickets to update: {len(tickets_to_update)} of {len(tickets)}")

    ticket_success = 0
    ticket_failed = 0

    for i, ticket in enumerate(tickets_to_update, 1):
        print(f"  [{i}/{len(tickets_to_update)}] Ticket #{ticket['number']}...", end=" ")
        if update_ticket(api_key, ticket["id"], TOPEKA_LOCATION_ID):
            print("OK")
            ticket_success += 1
        else:
            print("FAILED")
            ticket_failed += 1
        time.sleep(REQUEST_DELAY)

    # Update invoices
    invoices = get_all_invoices(api_key)
    invoices_to_update = [i for i in invoices if i.get("location_id") != TOPEKA_LOCATION_ID]
    print(f"\nInvoices to update: {len(invoices_to_update)} of {len(invoices)}")

    invoice_success = 0
    invoice_failed = 0

    for i, invoice in enumerate(invoices_to_update, 1):
        print(f"  [{i}/{len(invoices_to_update)}] Invoice #{invoice['number']}...", end=" ")
        if update_invoice(api_key, invoice["id"], TOPEKA_LOCATION_ID):
            print("OK")
            invoice_success += 1
        else:
            print("FAILED")
            invoice_failed += 1
        time.sleep(REQUEST_DELAY)

    # Summary
    print("\n" + "=" * 50)
    print("BULK UPDATE COMPLETE")
    print("=" * 50)
    print(f"Tickets:  {ticket_success} updated, {ticket_failed} failed")
    print(f"Invoices: {invoice_success} updated, {invoice_failed} failed")


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ("--test", "--run"):
        print(__doc__)
        sys.exit(1)

    mode = sys.argv[1]
    api_key = get_api_key()

    print("RepairShopr Location Update Script")
    print(f"Subdomain: {SUBDOMAIN}")
    print(f"Topeka location_id: {TOPEKA_LOCATION_ID}")

    if mode == "--test":
        run_test(api_key)
    else:
        # Confirmation prompt for bulk update
        print(f"\nThis will update ALL tickets and invoices to location_id {TOPEKA_LOCATION_ID}.")
        confirm = input("Type 'yes' to proceed: ")
        if confirm.lower() != "yes":
            print("Aborted.")
            sys.exit(0)
        run_bulk_update(api_key)


if __name__ == "__main__":
    main()
