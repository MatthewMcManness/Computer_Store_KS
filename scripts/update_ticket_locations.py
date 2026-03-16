#!/usr/bin/env python3
"""
RepairShopr Bulk Ticket Location Update Script

Updates all existing tickets to use the Topeka location (ID: 3311).
Run with --test first to verify on a single record, then --run for all.

Usage:
    python3 update_ticket_locations.py --test         # Update one ticket
    python3 update_ticket_locations.py --run          # Update all remaining tickets
    python3 update_ticket_locations.py --debug        # Show full ticket data for failures
    python3 update_ticket_locations.py --find-values  # Find valid values for Conditiondamange field

Environment:
    REPAIRSHOPR_API_KEY - Your RepairShopr API token
"""

import os
import sys
import time
import json
import requests
from datetime import datetime

# Configuration
SUBDOMAIN = "thecomputerstore"
BASE_URL = f"https://{SUBDOMAIN}.repairshopr.com/api/v1"
TOPEKA_LOCATION_ID = 3311

# Rate limiting: RepairShopr allows ~180 requests/minute
REQUEST_DELAY = 0.35  # seconds between requests

# Debug mode flag
DEBUG_MODE = False

# Required custom fields - uses ID for dropdowns, text for text fields
# Run --find-values to discover valid IDs, then update this
CONDITION_FIELD_NAME = "Condition/Damange"  # Note: typo in field name is intentional (matches RepairShopr)
CONDITION_DEFAULT_ID = "155312"  # ID for "Used" (discovered from ticket #28829)

# Additional required custom fields
REFERRED_BY_FIELD = "Referred By"
REFERRED_BY_DEFAULT = "106181"  # ID for "Other"
PIN_FIELD = "Pin"
PIN_DEFAULT = "x"  # Text field
PASSWORD_FIELD = "Password"
PASSWORD_DEFAULT = "x"  # Text field


def get_api_key() -> str:
    """Get API key from environment variable."""
    api_key = os.environ.get("REPAIRSHOPR_API_KEY")
    if not api_key:
        print("Error: REPAIRSHOPR_API_KEY environment variable not set.")
        print("\nSet it with:")
        print("  export REPAIRSHOPR_API_KEY='your-api-key-here'")
        sys.exit(1)
    return api_key


def make_request(method: str, endpoint: str, api_key: str, data: dict = None, retries: int = 3) -> tuple[dict, int]:
    """
    Make an API request to RepairShopr with retry logic.
    Returns tuple of (response_json, status_code).
    """
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

            # Return response data and status code (don't raise for errors yet)
            try:
                return response.json(), response.status_code
            except json.JSONDecodeError:
                return {"error": response.text}, response.status_code

        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            if attempt < retries - 1:
                wait_time = (attempt + 1) * 10  # 10s, 20s, 30s
                print(f"\n  Connection error, retrying in {wait_time}s... ", end="")
                time.sleep(wait_time)
            else:
                raise

    return {}, 0


def get_all_tickets(api_key: str) -> list:
    """Fetch all tickets with pagination."""
    print("Fetching all tickets...")
    all_tickets = []
    page = 1

    while True:
        data, status = make_request("GET", "tickets", api_key, {"page": page, "per_page": 100})

        if status != 200:
            print(f"  Error fetching page {page}: HTTP {status}")
            break

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


def update_ticket(api_key: str, ticket: dict, location_id: int) -> tuple[bool, str]:
    """
    Update a ticket's location.
    Also sets required custom fields if they're missing.
    Returns tuple of (success, error_details).
    """
    ticket_id = ticket["id"]

    # Build update payload
    update_data = {"location_id": location_id}

    # Check required custom fields and fill defaults if missing
    # We need to send ALL existing properties plus new ones, or they get wiped
    properties = ticket.get("properties", {}) or {}
    updated_properties = dict(properties)
    fields_added = []

    if not updated_properties.get(CONDITION_FIELD_NAME) and CONDITION_DEFAULT_ID:
        updated_properties[CONDITION_FIELD_NAME] = CONDITION_DEFAULT_ID
        fields_added.append(CONDITION_FIELD_NAME)

    if not updated_properties.get(REFERRED_BY_FIELD):
        updated_properties[REFERRED_BY_FIELD] = REFERRED_BY_DEFAULT
        fields_added.append(REFERRED_BY_FIELD)

    if not updated_properties.get(PIN_FIELD):
        updated_properties[PIN_FIELD] = PIN_DEFAULT
        fields_added.append(PIN_FIELD)

    if not updated_properties.get(PASSWORD_FIELD):
        updated_properties[PASSWORD_FIELD] = PASSWORD_DEFAULT
        fields_added.append(PASSWORD_FIELD)

    if fields_added:
        update_data["properties"] = updated_properties
        if DEBUG_MODE:
            print(f"  [Setting defaults for: {', '.join(fields_added)} - preserving {len(properties)} existing properties]")

    if DEBUG_MODE:
        print(f"  [Sending payload: {json.dumps(update_data, indent=2)}]")

    try:
        response_data, status_code = make_request(
            "PUT",
            f"tickets/{ticket_id}",
            api_key,
            update_data
        )

        if DEBUG_MODE:
            print(f"  [Response status: {status_code}]")
            print(f"  [Response body: {json.dumps(response_data, indent=2, default=str)[:500]}]")

        if status_code in (200, 201):
            return True, ""

        # Extract error details from response
        error_details = []

        def flatten_errors(obj, prefix=""):
            """Recursively flatten error objects into strings."""
            results = []
            if isinstance(obj, dict):
                for key, val in obj.items():
                    results.extend(flatten_errors(val, f"{prefix}{key}: " if prefix else f"{key}: "))
            elif isinstance(obj, list):
                for item in obj:
                    results.extend(flatten_errors(item, prefix))
            elif obj is not None:
                results.append(f"{prefix}{obj}" if prefix else str(obj))
            return results

        # Check for validation errors in various formats
        if "errors" in response_data:
            error_details.extend(flatten_errors(response_data["errors"]))

        if "error" in response_data:
            error_details.extend(flatten_errors(response_data["error"]))

        if "message" in response_data:
            error_details.append(str(response_data["message"]))

        # If no specific errors found, show full response
        if not error_details:
            error_details.append(f"HTTP {status_code}: {json.dumps(response_data)}")

        error_msg = "; ".join(error_details)

        # In debug mode, show full ticket data
        if DEBUG_MODE:
            print(f"\n  --- DEBUG: Full ticket data for #{ticket.get('number', ticket_id)} ---")
            print(f"  {json.dumps(ticket, indent=2, default=str)}")
            print(f"  --- END DEBUG ---\n")

        return False, error_msg

    except requests.exceptions.HTTPError as e:
        return False, str(e)


def save_failed_tickets(failed_tickets: list, filename: str = None):
    """Save failed ticket IDs and errors to a file for later analysis."""
    if not failed_tickets:
        return

    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"failed_tickets_{timestamp}.json"

    with open(filename, "w") as f:
        json.dump(failed_tickets, f, indent=2, default=str)

    print(f"\nFailed tickets saved to: {filename}")


def run_test(api_key: str):
    """Test mode: update one ticket."""
    print("\n" + "=" * 60)
    print("TEST MODE - Updating one ticket")
    print(f"Target location_id: {TOPEKA_LOCATION_ID}")
    print("=" * 60)

    # Get tickets that need updating
    tickets = get_all_tickets(api_key)
    tickets_to_update = [t for t in tickets if t.get("location_id") != TOPEKA_LOCATION_ID]

    if tickets_to_update:
        ticket = tickets_to_update[0]
        print(f"\nUpdating ticket #{ticket['number']} (ID: {ticket['id']})...")
        print(f"  Current location_id: {ticket.get('location_id')}")
        print(f"  Subject: {ticket.get('subject', 'N/A')}")
        print(f"  Status: {ticket.get('status', 'N/A')}")
        print(f"  Created: {ticket.get('created_at', 'N/A')}")

        success, error = update_ticket(api_key, ticket, TOPEKA_LOCATION_ID)
        if success:
            print(f"  ✓ Success! Updated to location_id: {TOPEKA_LOCATION_ID}")
        else:
            print(f"  ✗ Failed: {error}")
            print("\n  Full ticket data:")
            print(f"  {json.dumps(ticket, indent=2, default=str)}")
    else:
        print(f"\nNo tickets need updating (all {len(tickets)} already have location_id {TOPEKA_LOCATION_ID})")

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("Verify the changes in RepairShopr, then run with --run")
    print("=" * 60)


def run_bulk_update(api_key: str):
    """Bulk update all tickets."""
    print("\n" + "=" * 60)
    print("BULK UPDATE MODE - Updating all tickets")
    print(f"Target location_id: {TOPEKA_LOCATION_ID}")
    print("=" * 60)

    # Update tickets
    tickets = get_all_tickets(api_key)
    tickets_to_update = [t for t in tickets if t.get("location_id") != TOPEKA_LOCATION_ID]
    print(f"\nTickets to update: {len(tickets_to_update)} of {len(tickets)}")

    ticket_success = 0
    ticket_failed = 0
    failed_tickets = []

    for i, ticket in enumerate(tickets_to_update, 1):
        ticket_num = ticket.get('number', ticket['id'])
        print(f"  [{i}/{len(tickets_to_update)}] Ticket #{ticket_num}...", end=" ")

        success, error = update_ticket(api_key, ticket, TOPEKA_LOCATION_ID)
        if success:
            print("✓ OK")
            ticket_success += 1
        else:
            print(f"✗ FAILED")
            print(f"      Reason: {error}")
            ticket_failed += 1
            failed_tickets.append({
                "id": ticket["id"],
                "number": ticket_num,
                "subject": ticket.get("subject", ""),
                "status": ticket.get("status", ""),
                "created_at": ticket.get("created_at", ""),
                "current_location_id": ticket.get("location_id"),
                "error": error
            })

        time.sleep(REQUEST_DELAY)

    # Summary
    print("\n" + "=" * 60)
    print("BULK UPDATE COMPLETE")
    print("=" * 60)
    print(f"Tickets:  {ticket_success} updated, {ticket_failed} failed")

    if failed_tickets:
        save_failed_tickets(failed_tickets)

        # Show summary of failure reasons
        print("\nFailure reason summary:")
        reasons = {}
        for ft in failed_tickets:
            reason = ft["error"]
            # Truncate long reasons for summary
            if len(reason) > 80:
                reason = reason[:77] + "..."
            reasons[reason] = reasons.get(reason, 0) + 1

        for reason, count in sorted(reasons.items(), key=lambda x: -x[1]):
            print(f"  [{count}x] {reason}")


def run_debug(api_key: str):
    """Debug mode: show full data for tickets that fail to update."""
    global DEBUG_MODE
    DEBUG_MODE = True

    print("\n" + "=" * 60)
    print("DEBUG MODE - Testing updates with full error output")
    print(f"Target location_id: {TOPEKA_LOCATION_ID}")
    print("=" * 60)

    # Get tickets that need updating
    tickets = get_all_tickets(api_key)
    tickets_to_update = [t for t in tickets if t.get("location_id") != TOPEKA_LOCATION_ID]

    if not tickets_to_update:
        print(f"\nNo tickets need updating (all {len(tickets)} already have location_id {TOPEKA_LOCATION_ID})")
        return

    print(f"\nTesting first 5 tickets that need updating...\n")

    for i, ticket in enumerate(tickets_to_update[:5], 1):
        ticket_num = ticket.get('number', ticket['id'])
        print(f"--- Ticket #{ticket_num} (ID: {ticket['id']}) ---")
        print(f"  Subject: {ticket.get('subject', 'N/A')}")
        print(f"  Status: {ticket.get('status', 'N/A')}")
        print(f"  Current location_id: {ticket.get('location_id')}")
        print(f"  Customer ID: {ticket.get('customer_id', 'N/A')}")
        print(f"  Created: {ticket.get('created_at', 'N/A')}")

        # Show potentially problematic fields
        print(f"  Problem Type ID: {ticket.get('problem_type_id', 'N/A')}")
        print(f"  Ticket Type ID: {ticket.get('ticket_type_id', 'N/A')}")

        success, error = update_ticket(api_key, ticket, TOPEKA_LOCATION_ID)
        if success:
            print(f"  Result: ✓ Success")
        else:
            print(f"  Result: ✗ Failed - {error}")

        print()
        time.sleep(REQUEST_DELAY)

    print("=" * 60)
    print("DEBUG COMPLETE")
    print("=" * 60)


def find_field_values(api_key: str):
    """Find tickets with required custom fields populated to see valid values/IDs."""
    print("\n" + "=" * 60)
    print("FINDING VALID FIELD VALUES")
    print("Scanning all tickets for custom field values...")
    print("=" * 60)

    tickets = get_all_tickets(api_key)

    # Fields to scan for - add any required custom fields here
    fields_to_scan = [
        CONDITION_FIELD_NAME,  # "Condition/Damange"
        REFERRED_BY_FIELD,     # "Referred by"
        PIN_FIELD,             # "Pin"
        PASSWORD_FIELD,        # "Password"
    ]

    for field_name in fields_to_scan:
        print(f"\n{'─' * 50}")
        print(f"Field: '{field_name}'")
        print(f"{'─' * 50}")

        found_values = {}
        example_tickets = {}

        for ticket in tickets:
            properties = ticket.get("properties", {}) or {}
            value = properties.get(field_name)
            if value:
                found_values[value] = found_values.get(value, 0) + 1
                if value not in example_tickets:
                    example_tickets[value] = ticket

        if found_values:
            print(f"  Found in {sum(found_values.values())} tickets:")
            for value, count in sorted(found_values.items(), key=lambda x: -x[1]):
                example = example_tickets[value]
                print(f"  [{count:>4}x] value=\"{value}\"  (e.g. ticket #{example.get('number')})")
        else:
            print(f"  No tickets have this field populated.")

    # Also show all property keys for reference
    print(f"\n{'─' * 50}")
    print("All property keys found (first 100 tickets):")
    print(f"{'─' * 50}")
    all_keys = set()
    for ticket in tickets[:100]:
        properties = ticket.get("properties", {}) or {}
        all_keys.update(properties.keys())
    for key in sorted(all_keys):
        print(f"  - {key}")

    print("\n" + "=" * 60)
    print("Use the values above to update the DEFAULT constants in the script.")
    print("For dropdowns, the stored value is typically a numeric ID.")
    print("=" * 60)


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ("--test", "--run", "--debug", "--find-values"):
        print(__doc__)
        sys.exit(1)

    mode = sys.argv[1]
    api_key = get_api_key()

    print("RepairShopr Ticket Location Update Script")
    print(f"Subdomain: {SUBDOMAIN}")
    print(f"Topeka location_id: {TOPEKA_LOCATION_ID}")

    if mode == "--test":
        run_test(api_key)
    elif mode == "--debug":
        run_debug(api_key)
    elif mode == "--find-values":
        find_field_values(api_key)
    else:
        # Confirmation prompt for bulk update
        print(f"\nThis will update ALL tickets to location_id {TOPEKA_LOCATION_ID}.")
        confirm = input("Type 'yes' to proceed: ")
        if confirm.lower() != "yes":
            print("Aborted.")
            sys.exit(0)
        run_bulk_update(api_key)


if __name__ == "__main__":
    main()
