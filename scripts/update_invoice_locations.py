#!/usr/bin/env python3
"""
RepairShopr Bulk Invoice Location Update Script

Updates all existing invoices to use the Topeka location (ID: 3311).
Run with --test first to verify on a single record, then --run for all.

Usage:
    python3 update_invoice_locations.py --test    # Update one invoice
    python3 update_invoice_locations.py --run     # Update all remaining invoices
    python3 update_invoice_locations.py --debug   # Show full invoice data for failures

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


def get_all_invoices(api_key: str) -> list:
    """Fetch all invoices with pagination."""
    print("Fetching all invoices...")
    all_invoices = []
    page = 1

    while True:
        data, status = make_request("GET", "invoices", api_key, {"page": page, "per_page": 100})

        if status != 200:
            print(f"  Error fetching page {page}: HTTP {status}")
            break

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


def update_invoice(api_key: str, invoice: dict, location_id: int) -> tuple[bool, str]:
    """
    Update an invoice's location.
    Returns tuple of (success, error_details).
    """
    invoice_id = invoice["id"]

    try:
        response_data, status_code = make_request(
            "PUT",
            f"invoices/{invoice_id}",
            api_key,
            {"location_id": location_id}
        )

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

        # In debug mode, show full invoice data
        if DEBUG_MODE:
            print(f"\n  --- DEBUG: Full invoice data for #{invoice.get('number', invoice_id)} ---")
            print(f"  {json.dumps(invoice, indent=2, default=str)}")
            print(f"  --- END DEBUG ---\n")

        return False, error_msg

    except requests.exceptions.HTTPError as e:
        return False, str(e)


def save_failed_invoices(failed_invoices: list, filename: str = None):
    """Save failed invoice IDs and errors to a file for later analysis."""
    if not failed_invoices:
        return

    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"failed_invoices_{timestamp}.json"

    with open(filename, "w") as f:
        json.dump(failed_invoices, f, indent=2, default=str)

    print(f"\nFailed invoices saved to: {filename}")


def run_test(api_key: str):
    """Test mode: update one invoice."""
    print("\n" + "=" * 60)
    print("TEST MODE - Updating one invoice")
    print(f"Target location_id: {TOPEKA_LOCATION_ID}")
    print("=" * 60)

    # Get invoices that need updating
    invoices = get_all_invoices(api_key)
    invoices_to_update = [i for i in invoices if i.get("location_id") != TOPEKA_LOCATION_ID]

    if invoices_to_update:
        invoice = invoices_to_update[0]
        print(f"\nUpdating invoice #{invoice['number']} (ID: {invoice['id']})...")
        print(f"  Current location_id: {invoice.get('location_id')}")
        print(f"  Customer: {invoice.get('customer_business_then_name', 'N/A')}")
        print(f"  Total: ${float(invoice.get('total', 0) or 0):.2f}")
        print(f"  Status: {invoice.get('status', 'N/A')}")
        print(f"  Created: {invoice.get('created_at', 'N/A')}")

        success, error = update_invoice(api_key, invoice, TOPEKA_LOCATION_ID)
        if success:
            print(f"  ✓ Success! Updated to location_id: {TOPEKA_LOCATION_ID}")
        else:
            print(f"  ✗ Failed: {error}")
            print("\n  Full invoice data:")
            print(f"  {json.dumps(invoice, indent=2, default=str)}")
    else:
        print(f"\nNo invoices need updating (all {len(invoices)} already have location_id {TOPEKA_LOCATION_ID})")

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("Verify the changes in RepairShopr, then run with --run")
    print("=" * 60)


def run_bulk_update(api_key: str):
    """Bulk update all invoices."""
    print("\n" + "=" * 60)
    print("BULK UPDATE MODE - Updating all invoices")
    print(f"Target location_id: {TOPEKA_LOCATION_ID}")
    print("=" * 60)

    # Update invoices
    invoices = get_all_invoices(api_key)
    invoices_to_update = [i for i in invoices if i.get("location_id") != TOPEKA_LOCATION_ID]
    print(f"\nInvoices to update: {len(invoices_to_update)} of {len(invoices)}")

    invoice_success = 0
    invoice_failed = 0
    failed_invoices = []

    for i, invoice in enumerate(invoices_to_update, 1):
        invoice_num = invoice.get('number', invoice['id'])
        print(f"  [{i}/{len(invoices_to_update)}] Invoice #{invoice_num}...", end=" ")

        success, error = update_invoice(api_key, invoice, TOPEKA_LOCATION_ID)
        if success:
            print("✓ OK")
            invoice_success += 1
        else:
            print(f"✗ FAILED")
            print(f"      Reason: {error}")
            invoice_failed += 1
            failed_invoices.append({
                "id": invoice["id"],
                "number": invoice_num,
                "customer": invoice.get("customer_business_then_name", ""),
                "total": invoice.get("total", 0),
                "status": invoice.get("status", ""),
                "created_at": invoice.get("created_at", ""),
                "current_location_id": invoice.get("location_id"),
                "error": error
            })

        time.sleep(REQUEST_DELAY)

    # Summary
    print("\n" + "=" * 60)
    print("BULK UPDATE COMPLETE")
    print("=" * 60)
    print(f"Invoices:  {invoice_success} updated, {invoice_failed} failed")

    if failed_invoices:
        save_failed_invoices(failed_invoices)

        # Show summary of failure reasons
        print("\nFailure reason summary:")
        reasons = {}
        for fi in failed_invoices:
            reason = fi["error"]
            # Truncate long reasons for summary
            if len(reason) > 80:
                reason = reason[:77] + "..."
            reasons[reason] = reasons.get(reason, 0) + 1

        for reason, count in sorted(reasons.items(), key=lambda x: -x[1]):
            print(f"  [{count}x] {reason}")


def run_debug(api_key: str):
    """Debug mode: show full data for invoices that fail to update."""
    global DEBUG_MODE
    DEBUG_MODE = True

    print("\n" + "=" * 60)
    print("DEBUG MODE - Testing updates with full error output")
    print(f"Target location_id: {TOPEKA_LOCATION_ID}")
    print("=" * 60)

    # Get invoices that need updating
    invoices = get_all_invoices(api_key)
    invoices_to_update = [i for i in invoices if i.get("location_id") != TOPEKA_LOCATION_ID]

    if not invoices_to_update:
        print(f"\nNo invoices need updating (all {len(invoices)} already have location_id {TOPEKA_LOCATION_ID})")
        return

    print(f"\nTesting first 5 invoices that need updating...\n")

    for i, invoice in enumerate(invoices_to_update[:5], 1):
        invoice_num = invoice.get('number', invoice['id'])
        print(f"--- Invoice #{invoice_num} (ID: {invoice['id']}) ---")
        print(f"  Customer: {invoice.get('customer_business_then_name', 'N/A')}")
        print(f"  Total: ${float(invoice.get('total', 0) or 0):.2f}")
        print(f"  Status: {invoice.get('status', 'N/A')}")
        print(f"  Current location_id: {invoice.get('location_id')}")
        print(f"  Customer ID: {invoice.get('customer_id', 'N/A')}")
        print(f"  Created: {invoice.get('created_at', 'N/A')}")

        # Show potentially problematic fields
        print(f"  Ticket ID: {invoice.get('ticket_id', 'N/A')}")
        print(f"  Is Paid: {invoice.get('is_paid', 'N/A')}")

        success, error = update_invoice(api_key, invoice, TOPEKA_LOCATION_ID)
        if success:
            print(f"  Result: ✓ Success")
        else:
            print(f"  Result: ✗ Failed - {error}")

        print()
        time.sleep(REQUEST_DELAY)

    print("=" * 60)
    print("DEBUG COMPLETE")
    print("=" * 60)


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ("--test", "--run", "--debug"):
        print(__doc__)
        sys.exit(1)

    mode = sys.argv[1]
    api_key = get_api_key()

    print("RepairShopr Invoice Location Update Script")
    print(f"Subdomain: {SUBDOMAIN}")
    print(f"Topeka location_id: {TOPEKA_LOCATION_ID}")

    if mode == "--test":
        run_test(api_key)
    elif mode == "--debug":
        run_debug(api_key)
    else:
        # Confirmation prompt for bulk update
        print(f"\nThis will update ALL invoices to location_id {TOPEKA_LOCATION_ID}.")
        confirm = input("Type 'yes' to proceed: ")
        if confirm.lower() != "yes":
            print("Aborted.")
            sys.exit(0)
        run_bulk_update(api_key)


if __name__ == "__main__":
    main()
