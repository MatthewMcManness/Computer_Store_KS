"""
Gallery Manager for Computer Store Kansas Website
A professional GUI application for managing the computer gallery on the website.

Author: Claude
Version: 1.0
Date: 2025-11-10

Features:
- Modern CustomTkinter UI
- Add, Edit, Delete computer cards
- Image upload and optimization
- Live preview of changes
- Git integration for publishing
- Automatic backup before changes
"""

import customtkinter as ctk
from tkinter import filedialog, messagebox
from bs4 import BeautifulSoup
from PIL import Image, ImageTk
import subprocess
import os
import shutil
import re
from datetime import datetime
from pathlib import Path
import threading


class GalleryManager(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Configure window
        self.title("Computer Store Kansas - Gallery Manager")
        self.geometry("1400x900")

        # Set color theme
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        # File paths
        self.website_dir = Path(r"C:\Users\Matthew\Documents\GitHub\Computer_Store_KS")
        self.html_file = self.website_dir / "index.html"
        self.gallery_dir = self.website_dir / "assets" / "gallery"
        self.backup_dir = self.website_dir / "backups"

        # Ensure directories exist
        self.gallery_dir.mkdir(parents=True, exist_ok=True)
        self.backup_dir.mkdir(parents=True, exist_ok=True)

        # Data storage
        self.computers = []
        self.current_selection = None
        self.current_image_path = None

        # Create UI
        self.create_ui()

        # Load data
        self.load_computers()

    def create_ui(self):
        """Create the main user interface."""
        # Create main layout - 3 columns
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Left panel - Computer list
        self.create_left_panel()

        # Middle panel - Preview
        self.create_middle_panel()

        # Right panel - Edit controls
        self.create_right_panel()

        # Bottom status bar
        self.create_status_bar()

    def create_left_panel(self):
        """Create the left panel with computer list."""
        left_frame = ctk.CTkFrame(self, width=300)
        left_frame.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)
        left_frame.grid_propagate(False)

        # Title
        title = ctk.CTkLabel(left_frame, text="Gallery Computers",
                            font=ctk.CTkFont(size=20, weight="bold"))
        title.pack(pady=10, padx=10)

        # Filter buttons
        filter_frame = ctk.CTkFrame(left_frame)
        filter_frame.pack(fill="x", padx=10, pady=5)

        self.filter_var = ctk.StringVar(value="all")

        filters = [
            ("All", "all"),
            ("Desktop", "desktop"),
            ("Laptop", "laptop"),
            ("Custom", "custom"),
            ("Refurb", "refurbished")
        ]

        for i, (label, value) in enumerate(filters):
            btn = ctk.CTkRadioButton(filter_frame, text=label,
                                    variable=self.filter_var, value=value,
                                    command=self.apply_filter)
            btn.grid(row=i//3, column=i%3, padx=5, pady=2, sticky="w")

        # Scrollable list
        self.list_frame = ctk.CTkScrollableFrame(left_frame)
        self.list_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Action buttons
        action_frame = ctk.CTkFrame(left_frame)
        action_frame.pack(fill="x", padx=10, pady=10)

        btn_add = ctk.CTkButton(action_frame, text="Add New",
                               command=self.add_computer,
                               fg_color="green", hover_color="darkgreen")
        btn_add.pack(fill="x", pady=2)

        btn_edit = ctk.CTkButton(action_frame, text="Edit Selected",
                                command=self.edit_computer)
        btn_edit.pack(fill="x", pady=2)

        btn_delete = ctk.CTkButton(action_frame, text="Delete Selected",
                                  command=self.delete_computer,
                                  fg_color="red", hover_color="darkred")
        btn_delete.pack(fill="x", pady=2)

    def create_middle_panel(self):
        """Create the middle panel with preview."""
        middle_frame = ctk.CTkFrame(self)
        middle_frame.grid(row=0, column=1, sticky="nsew", padx=10, pady=10)

        # Title
        title = ctk.CTkLabel(middle_frame, text="Preview",
                           font=ctk.CTkFont(size=20, weight="bold"))
        title.pack(pady=10)

        # Preview card frame
        self.preview_frame = ctk.CTkFrame(middle_frame, fg_color="transparent")
        self.preview_frame.pack(fill="both", expand=True, padx=20, pady=10)

        # Preview content
        self.preview_content = ctk.CTkLabel(self.preview_frame,
                                           text="Select a computer to preview",
                                           font=ctk.CTkFont(size=16))
        self.preview_content.pack(expand=True)

    def create_right_panel(self):
        """Create the right panel with edit controls."""
        right_frame = ctk.CTkFrame(self, width=350)
        right_frame.grid(row=0, column=2, sticky="nsew", padx=10, pady=10)
        right_frame.grid_propagate(False)

        # Title
        title = ctk.CTkLabel(right_frame, text="Git Actions",
                           font=ctk.CTkFont(size=20, weight="bold"))
        title.pack(pady=10)

        # Git status
        self.git_status_label = ctk.CTkLabel(right_frame, text="Git Status: Unknown",
                                            font=ctk.CTkFont(size=12))
        self.git_status_label.pack(pady=5)

        # Git actions
        git_frame = ctk.CTkFrame(right_frame)
        git_frame.pack(fill="x", padx=10, pady=10)

        btn_status = ctk.CTkButton(git_frame, text="Check Git Status",
                                  command=self.check_git_status)
        btn_status.pack(fill="x", pady=5)

        btn_publish = ctk.CTkButton(git_frame, text="Publish Changes",
                                   command=self.publish_changes,
                                   fg_color="green", hover_color="darkgreen")
        btn_publish.pack(fill="x", pady=5)

        # Separator
        separator = ctk.CTkLabel(right_frame, text="─" * 40)
        separator.pack(pady=20)

        # Help section
        help_title = ctk.CTkLabel(right_frame, text="Quick Help",
                                 font=ctk.CTkFont(size=16, weight="bold"))
        help_title.pack(pady=5)

        help_text = """
How to use:

1. Select a computer from the list
2. Click Edit to modify details
3. Use Add New to create cards
4. Delete removes selected card
5. Publish commits to Git

Images are automatically:
• Copied to gallery folder
• Renamed to match type
• Optimized for web
• Backed up before changes
        """

        help_label = ctk.CTkLabel(right_frame, text=help_text,
                                 font=ctk.CTkFont(size=12),
                                 justify="left")
        help_label.pack(pady=10, padx=10)

    def create_status_bar(self):
        """Create the bottom status bar."""
        status_frame = ctk.CTkFrame(self, height=40)
        status_frame.grid(row=1, column=0, columnspan=3, sticky="ew", padx=10, pady=5)

        self.status_label = ctk.CTkLabel(status_frame,
                                        text="Ready | No computers loaded",
                                        font=ctk.CTkFont(size=12))
        self.status_label.pack(side="left", padx=10)

    def load_computers(self):
        """Load computers from index.html."""
        try:
            if not self.html_file.exists():
                self.update_status(f"Error: index.html not found at {self.html_file}")
                return

            with open(self.html_file, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')

            # Find gallery grid
            gallery_grid = soup.find('div', {'id': 'gallery-grid'})
            if not gallery_grid:
                self.update_status("Error: Gallery grid not found in HTML")
                return

            # Parse all gallery cards
            self.computers = []
            cards = gallery_grid.find_all('div', {'class': 'gallery-card'})

            for card in cards:
                computer = self.parse_card(card)
                if computer:
                    self.computers.append(computer)

            # Update UI
            self.refresh_list()
            self.update_status(f"Loaded {len(self.computers)} computers successfully")

        except Exception as e:
            self.update_status(f"Error loading computers: {str(e)}")
            messagebox.showerror("Load Error", f"Failed to load computers:\n{str(e)}")

    def parse_card(self, card):
        """Parse a single gallery card element."""
        try:
            data = {
                'id': card.get('data-computer-id'),
                'type': card.get('data-type'),
                'category': card.get('data-category')
            }

            # Parse badge
            badge = card.find('div', class_=lambda x: x and 'gallery-card-badge' in x)
            data['badge_text'] = badge.get_text(strip=True) if badge else ''

            # Parse image
            img = card.find('img')
            data['image'] = img.get('src', '') if img else ''
            data['alt'] = img.get('alt', '') if img else ''

            # Parse back content
            title = card.find('h3', {'class': 'gallery-card-title'})
            data['title'] = title.get_text(strip=True) if title else ''

            price = card.find('div', {'class': 'gallery-card-price'})
            data['price'] = price.get_text(strip=True) if price else ''

            # Parse specs
            specs = card.find_all('div', {'class': 'spec-item'})
            data['specs'] = []
            for spec in specs[:4]:  # Max 4 specs
                text = spec.get_text(strip=True)
                if ':' in text:
                    label, value = text.split(':', 1)
                    data['specs'].append({
                        'label': label.strip(),
                        'value': value.strip()
                    })

            # Ensure we have exactly 4 specs
            while len(data['specs']) < 4:
                data['specs'].append({'label': '', 'value': ''})

            return data

        except Exception as e:
            print(f"Error parsing card: {e}")
            return None

    def refresh_list(self):
        """Refresh the computer list display."""
        # Clear existing items
        for widget in self.list_frame.winfo_children():
            widget.destroy()

        # Apply filter
        filter_value = self.filter_var.get()
        filtered = self.computers

        if filter_value != "all":
            filtered = [c for c in self.computers
                       if c['type'] == filter_value or c['category'] == filter_value]

        # Create list items
        for computer in filtered:
            self.create_list_item(computer)

        if not filtered:
            label = ctk.CTkLabel(self.list_frame, text="No computers match filter",
                               font=ctk.CTkFont(size=12, slant="italic"))
            label.pack(pady=20)

    def create_list_item(self, computer):
        """Create a single list item for a computer."""
        frame = ctk.CTkFrame(self.list_frame)
        frame.pack(fill="x", padx=5, pady=5)

        # Load thumbnail if exists
        img_path = self.website_dir / computer['image'].replace('./', '')
        if img_path.exists():
            try:
                img = Image.open(img_path)
                img.thumbnail((60, 60))
                photo = ctk.CTkImage(light_image=img, dark_image=img, size=(60, 60))
                img_label = ctk.CTkLabel(frame, image=photo, text="")
                img_label.image = photo  # Keep reference
                img_label.pack(side="left", padx=5, pady=5)
            except:
                pass

        # Text info
        text_frame = ctk.CTkFrame(frame, fg_color="transparent")
        text_frame.pack(side="left", fill="both", expand=True, padx=5)

        title = ctk.CTkLabel(text_frame, text=computer['title'],
                           font=ctk.CTkFont(size=13, weight="bold"),
                           anchor="w")
        title.pack(fill="x")

        info = f"{computer['price']} | {computer['type'].title()} | {computer['category'].title()}"
        details = ctk.CTkLabel(text_frame, text=info,
                             font=ctk.CTkFont(size=10),
                             anchor="w", text_color="gray")
        details.pack(fill="x")

        # Make clickable
        frame.bind("<Button-1>", lambda e, c=computer: self.select_computer(c))
        for child in frame.winfo_children():
            child.bind("<Button-1>", lambda e, c=computer: self.select_computer(c))
            for subchild in child.winfo_children():
                subchild.bind("<Button-1>", lambda e, c=computer: self.select_computer(c))

    def select_computer(self, computer):
        """Select a computer and show preview."""
        self.current_selection = computer
        self.show_preview(computer)
        self.update_status(f"Selected: {computer['title']}")

    def show_preview(self, computer):
        """Display preview of computer card."""
        # Clear previous preview
        for widget in self.preview_frame.winfo_children():
            widget.destroy()

        # Create card preview
        card_frame = ctk.CTkFrame(self.preview_frame, corner_radius=15,
                                 border_width=2, border_color="gray")
        card_frame.pack(expand=True, padx=20, pady=20)

        # Image
        img_path = self.website_dir / computer['image'].replace('./', '')
        if img_path.exists():
            try:
                img = Image.open(img_path)
                img.thumbnail((400, 400))
                photo = ctk.CTkImage(light_image=img, dark_image=img,
                                   size=(min(img.width, 400), min(img.height, 400)))
                img_label = ctk.CTkLabel(card_frame, image=photo, text="")
                img_label.image = photo
                img_label.pack(pady=10)
            except Exception as e:
                print(f"Error loading image: {e}")

        # Badge
        badge_color = "green" if computer['category'] == "custom" else "orange"
        badge = ctk.CTkLabel(card_frame, text=computer['badge_text'],
                           font=ctk.CTkFont(size=12, weight="bold"),
                           fg_color=badge_color, corner_radius=5,
                           padx=10, pady=5)
        badge.pack(pady=5)

        # Title
        title = ctk.CTkLabel(card_frame, text=computer['title'],
                           font=ctk.CTkFont(size=20, weight="bold"))
        title.pack(pady=5)

        # Price
        price = ctk.CTkLabel(card_frame, text=computer['price'],
                           font=ctk.CTkFont(size=24, weight="bold"),
                           text_color="lightblue")
        price.pack(pady=5)

        # Specs
        specs_frame = ctk.CTkFrame(card_frame, fg_color="transparent")
        specs_frame.pack(pady=10, padx=20, fill="both")

        for spec in computer['specs']:
            if spec['label'] and spec['value']:
                spec_text = f"{spec['label']}: {spec['value']}"
                spec_label = ctk.CTkLabel(specs_frame, text=spec_text,
                                         font=ctk.CTkFont(size=12),
                                         anchor="w")
                spec_label.pack(fill="x", pady=2)

    def apply_filter(self):
        """Apply the selected filter."""
        self.refresh_list()

    def add_computer(self):
        """Open dialog to add a new computer."""
        dialog = ComputerEditDialog(self, None, self.get_next_id())
        self.wait_window(dialog)

        if dialog.result:
            # Create backup
            self.create_backup()

            # Add to HTML
            if self.add_card_to_html(dialog.result):
                # Reload computers
                self.load_computers()
                messagebox.showinfo("Success", "Computer added successfully!")
            else:
                messagebox.showerror("Error", "Failed to add computer to HTML")

    def edit_computer(self):
        """Open dialog to edit selected computer."""
        if not self.current_selection:
            messagebox.showwarning("No Selection", "Please select a computer to edit")
            return

        dialog = ComputerEditDialog(self, self.current_selection)
        self.wait_window(dialog)

        if dialog.result:
            # Create backup
            self.create_backup()

            # Update HTML
            if self.update_card_in_html(dialog.result):
                # Reload computers
                self.load_computers()
                messagebox.showinfo("Success", "Computer updated successfully!")
            else:
                messagebox.showerror("Error", "Failed to update computer in HTML")

    def delete_computer(self):
        """Delete the selected computer."""
        if not self.current_selection:
            messagebox.showwarning("No Selection", "Please select a computer to delete")
            return

        # Confirm deletion
        result = messagebox.askyesno("Confirm Delete",
                                    f"Are you sure you want to delete '{self.current_selection['title']}'?\n\n"
                                    "This will remove it from the website.")

        if result:
            # Ask about image
            delete_image = messagebox.askyesno("Delete Image?",
                                               "Do you also want to delete the image file?")

            # Create backup
            self.create_backup()

            # Delete from HTML
            if self.delete_card_from_html(self.current_selection['id']):
                # Delete image if requested
                if delete_image:
                    img_path = self.website_dir / self.current_selection['image'].replace('./', '')
                    if img_path.exists():
                        try:
                            img_path.unlink()
                        except Exception as e:
                            print(f"Error deleting image: {e}")

                # Reload computers
                self.current_selection = None
                self.load_computers()

                # Clear preview
                for widget in self.preview_frame.winfo_children():
                    widget.destroy()
                label = ctk.CTkLabel(self.preview_frame,
                                   text="Computer deleted successfully",
                                   font=ctk.CTkFont(size=16))
                label.pack(expand=True)

                messagebox.showinfo("Success", "Computer deleted successfully!")
            else:
                messagebox.showerror("Error", "Failed to delete computer from HTML")

    def get_next_id(self):
        """Get the next available computer ID."""
        if not self.computers:
            return "1"

        ids = [int(c['id']) for c in self.computers if c['id'].isdigit()]
        return str(max(ids) + 1) if ids else "1"

    def add_card_to_html(self, computer_data):
        """Add a new card to the HTML file."""
        try:
            with open(self.html_file, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')

            # Find gallery grid
            gallery_grid = soup.find('div', {'id': 'gallery-grid'})
            if not gallery_grid:
                return False

            # Create new card
            new_card = self.create_card_element(soup, computer_data)

            # Append to gallery
            gallery_grid.append(new_card)

            # Save HTML
            with open(self.html_file, 'w', encoding='utf-8') as f:
                f.write(str(soup.prettify()))

            return True

        except Exception as e:
            print(f"Error adding card: {e}")
            return False

    def update_card_in_html(self, computer_data):
        """Update an existing card in the HTML file."""
        try:
            with open(self.html_file, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')

            # Find the card to update
            card = soup.find('div', {'data-computer-id': computer_data['id']})
            if not card:
                return False

            # Create new card
            new_card = self.create_card_element(soup, computer_data)

            # Replace old card
            card.replace_with(new_card)

            # Save HTML
            with open(self.html_file, 'w', encoding='utf-8') as f:
                f.write(str(soup.prettify()))

            return True

        except Exception as e:
            print(f"Error updating card: {e}")
            return False

    def delete_card_from_html(self, computer_id):
        """Delete a card from the HTML file."""
        try:
            with open(self.html_file, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')

            # Find and remove the card
            card = soup.find('div', {'data-computer-id': computer_id})
            if not card:
                return False

            card.decompose()

            # Save HTML
            with open(self.html_file, 'w', encoding='utf-8') as f:
                f.write(str(soup.prettify()))

            return True

        except Exception as e:
            print(f"Error deleting card: {e}")
            return False

    def create_card_element(self, soup, data):
        """Create a BeautifulSoup card element from computer data."""
        # Main card div
        card = soup.new_tag('div', attrs={
            'class': 'gallery-card',
            'data-type': data['type'],
            'data-category': data['category'],
            'data-computer-id': data['id']
        })

        # Inner container
        inner = soup.new_tag('div', attrs={'class': 'gallery-card-inner'})
        card.append(inner)

        # Front of card
        front = soup.new_tag('div', attrs={'class': 'gallery-card-front'})
        inner.append(front)

        # Badge
        badge_class = f"gallery-card-badge badge-{data['category']}"
        badge = soup.new_tag('div', attrs={'class': badge_class})
        badge.string = data['badge_text']
        front.append(badge)

        # Image container
        img_container = soup.new_tag('div', attrs={'class': 'gallery-card-image'})
        front.append(img_container)

        # Image
        img = soup.new_tag('img', attrs={
            'src': data['image'],
            'alt': data['title'],
            'onerror': "this.src='./assets/logo.png'"
        })
        img_container.append(img)

        # Back of card
        back = soup.new_tag('div', attrs={'class': 'gallery-card-back'})
        inner.append(back)

        # Title
        title = soup.new_tag('h3', attrs={'class': 'gallery-card-title'})
        title.string = data['title']
        back.append(title)

        # Price
        price = soup.new_tag('div', attrs={'class': 'gallery-card-price'})
        price.string = data['price']
        back.append(price)

        # Specs container
        specs_container = soup.new_tag('div', attrs={'class': 'gallery-card-specs'})
        back.append(specs_container)

        # Individual specs
        for spec in data['specs']:
            if spec['label'] and spec['value']:
                spec_item = soup.new_tag('div', attrs={'class': 'spec-item'})

                label_tag = soup.new_tag('strong')
                label_tag.string = f"{spec['label']}:"
                spec_item.append(label_tag)
                spec_item.append(f" {spec['value']}")

                specs_container.append(spec_item)

        return card

    def create_backup(self):
        """Create a backup of index.html."""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = self.backup_dir / f"index_backup_{timestamp}.html"
            shutil.copy2(self.html_file, backup_file)
            self.update_status(f"Backup created: {backup_file.name}")
        except Exception as e:
            print(f"Error creating backup: {e}")

    def check_git_status(self):
        """Check Git status of the repository."""
        try:
            os.chdir(self.website_dir)
            result = subprocess.run(['git', 'status', '--short'],
                                  capture_output=True, text=True, timeout=10)

            if result.returncode == 0:
                status = result.stdout.strip()
                if status:
                    self.git_status_label.configure(text=f"Git Status: Changes detected\n{status[:100]}")
                else:
                    self.git_status_label.configure(text="Git Status: Clean (no changes)")
            else:
                self.git_status_label.configure(text="Git Status: Error checking status")

        except subprocess.TimeoutExpired:
            messagebox.showerror("Timeout", "Git command timed out")
        except FileNotFoundError:
            messagebox.showerror("Git Not Found", "Git is not installed or not in PATH")
        except Exception as e:
            messagebox.showerror("Error", f"Error checking Git status:\n{str(e)}")

    def publish_changes(self):
        """Commit and push changes to Git."""
        # Confirm action
        result = messagebox.askyesno("Confirm Publish",
                                    "This will:\n"
                                    "1. Add index.html and gallery images to Git\n"
                                    "2. Commit with automated message\n"
                                    "3. Push to BOTH current branch AND main\n\n"
                                    "Continue?")

        if not result:
            return

        # Create progress window
        progress_window = ctk.CTkToplevel(self)
        progress_window.title("Publishing Changes")
        progress_window.geometry("600x450")
        progress_window.transient(self)
        progress_window.grab_set()

        label = ctk.CTkLabel(progress_window, text="Publishing changes to Git...",
                           font=ctk.CTkFont(size=16, weight="bold"))
        label.pack(pady=10)

        output_text = ctk.CTkTextbox(progress_window, width=560, height=350)
        output_text.pack(padx=20, pady=10)

        def run_git_commands():
            try:
                os.chdir(self.website_dir)

                # Get current branch
                result = subprocess.run(['git', 'branch', '--show-current'],
                                      capture_output=True, text=True, timeout=10)
                current_branch = result.stdout.strip()
                output_text.insert("end", f"Current branch: {current_branch}\n")
                output_text.see("end")
                progress_window.update()

                commands = [
                    (['git', 'add', 'index.html'], "Adding index.html..."),
                    (['git', 'add', 'assets/gallery/'], "Adding gallery images..."),
                    (['git', 'commit', '-m', 'Update gallery via Gallery Manager'], "Creating commit..."),
                    (['git', 'push', 'origin', current_branch], f"Pushing to {current_branch}..."),
                ]

                # If not on main, also push to main
                if current_branch != 'main':
                    commands.extend([
                        (['git', 'checkout', 'main'], "Switching to main branch..."),
                        (['git', 'merge', current_branch, '--no-edit'], "Merging changes into main..."),
                        (['git', 'push', 'origin', 'main'], "Pushing to main..."),
                        (['git', 'checkout', current_branch], f"Switching back to {current_branch}...")
                    ])

                for cmd, description in commands:
                    output_text.insert("end", f"\n{description}\n")
                    output_text.see("end")
                    progress_window.update()

                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

                    output_text.insert("end", f"Command: {' '.join(cmd)}\n")
                    if result.stdout:
                        output_text.insert("end", f"Output: {result.stdout}\n")
                    if result.stderr:
                        output_text.insert("end", f"Info: {result.stderr}\n")
                    output_text.see("end")
                    progress_window.update()

                    # Check if command failed (ignore "nothing to commit" and "already up to date")
                    if result.returncode != 0:
                        if 'nothing to commit' in result.stdout.lower() or 'already up to date' in result.stdout.lower():
                            output_text.insert("end", "→ No changes to commit\n")
                        else:
                            raise Exception(f"Git command failed: {result.stderr}")

                output_text.insert("end", "\n✓ Publishing completed successfully!\n")
                output_text.insert("end", "✓ Changes pushed to main branch - website will update shortly!\n")
                output_text.see("end")

                close_btn = ctk.CTkButton(progress_window, text="Close",
                                         command=progress_window.destroy)
                close_btn.pack(pady=10)

                self.update_status("Changes published to Git (main branch) successfully")

            except subprocess.TimeoutExpired:
                output_text.insert("end", "\n✗ Error: Git command timed out\n")
                output_text.see("end")
            except Exception as e:
                output_text.insert("end", f"\n✗ Error: {str(e)}\n")
                output_text.see("end")

        # Run in thread to prevent UI freeze
        thread = threading.Thread(target=run_git_commands, daemon=True)
        thread.start()

    def update_status(self, message):
        """Update the status bar message."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.status_label.configure(text=f"{timestamp} | {message}")


class ComputerEditDialog(ctk.CTkToplevel):
    """Dialog window for adding/editing computer details."""

    def __init__(self, parent, computer_data=None, new_id=None):
        super().__init__(parent)

        self.parent = parent
        self.computer_data = computer_data
        self.result = None
        self.new_image_path = None

        # Configure window
        title = "Edit Computer" if computer_data else "Add New Computer"
        self.title(title)
        self.geometry("700x800")

        # Make modal
        self.transient(parent)
        self.grab_set()

        # Create UI
        self.create_form(new_id)

        # Center window
        self.update_idletasks()
        x = (self.winfo_screenwidth() // 2) - (self.winfo_width() // 2)
        y = (self.winfo_screenheight() // 2) - (self.winfo_height() // 2)
        self.geometry(f"+{x}+{y}")

    def create_form(self, new_id):
        """Create the edit form."""
        # Scrollable frame
        scroll_frame = ctk.CTkScrollableFrame(self)
        scroll_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Computer ID (hidden or auto-generated)
        self.id_var = ctk.StringVar(value=self.computer_data['id'] if self.computer_data else new_id)

        # Computer Name
        ctk.CTkLabel(scroll_frame, text="Computer Name:",
                    font=ctk.CTkFont(size=13, weight="bold")).pack(anchor="w", pady=(0, 5))
        self.name_entry = ctk.CTkEntry(scroll_frame, width=600, height=35)
        self.name_entry.pack(pady=(0, 15))
        if self.computer_data:
            self.name_entry.insert(0, self.computer_data['title'])

        # Type (Desktop/Laptop)
        ctk.CTkLabel(scroll_frame, text="Type:",
                    font=ctk.CTkFont(size=13, weight="bold")).pack(anchor="w", pady=(0, 5))
        self.type_var = ctk.StringVar(value=self.computer_data['type'] if self.computer_data else "desktop")
        type_frame = ctk.CTkFrame(scroll_frame)
        type_frame.pack(fill="x", pady=(0, 15))

        desktop_radio = ctk.CTkRadioButton(type_frame, text="Desktop", variable=self.type_var,
                          value="desktop", command=self.update_category_options)
        desktop_radio.pack(side="left", padx=10)

        laptop_radio = ctk.CTkRadioButton(type_frame, text="Laptop", variable=self.type_var,
                          value="laptop", command=self.update_category_options)
        laptop_radio.pack(side="left", padx=10)

        # Category (Custom/Refurbished for Desktop, New/Refurbished for Laptop)
        self.category_label = ctk.CTkLabel(scroll_frame, text="Category:",
                    font=ctk.CTkFont(size=13, weight="bold"))
        self.category_label.pack(anchor="w", pady=(0, 5))
        self.category_var = ctk.StringVar(value=self.computer_data['category'] if self.computer_data else "custom")
        self.cat_frame = ctk.CTkFrame(scroll_frame)
        self.cat_frame.pack(fill="x", pady=(0, 15))

        # We'll populate this dynamically based on type
        self.category_radio_1 = None
        self.category_radio_2 = None
        self.update_category_options()

        # Price
        ctk.CTkLabel(scroll_frame, text="Price:",
                    font=ctk.CTkFont(size=13, weight="bold")).pack(anchor="w", pady=(0, 5))
        self.price_entry = ctk.CTkEntry(scroll_frame, width=200, height=35,
                                       placeholder_text="$999")
        self.price_entry.pack(anchor="w", pady=(0, 15))
        if self.computer_data:
            self.price_entry.insert(0, self.computer_data['price'])

        # Image
        ctk.CTkLabel(scroll_frame, text="Image:",
                    font=ctk.CTkFont(size=13, weight="bold")).pack(anchor="w", pady=(0, 5))

        image_frame = ctk.CTkFrame(scroll_frame)
        image_frame.pack(fill="x", pady=(0, 15))

        btn_upload = ctk.CTkButton(image_frame, text="Upload Image",
                                   command=self.upload_image)
        btn_upload.pack(side="left", padx=5)

        self.image_label = ctk.CTkLabel(image_frame, text="No image selected")
        self.image_label.pack(side="left", padx=10)

        # Image preview
        self.image_preview_label = ctk.CTkLabel(scroll_frame, text="")
        self.image_preview_label.pack(pady=10)

        # If editing, show current image
        if self.computer_data and self.computer_data['image']:
            img_path = self.parent.website_dir / self.computer_data['image'].replace('./', '')
            if img_path.exists():
                self.show_image_preview(img_path)

        # Specs (4 fields)
        ctk.CTkLabel(scroll_frame, text="Specifications:",
                    font=ctk.CTkFont(size=13, weight="bold")).pack(anchor="w", pady=(10, 5))

        self.spec_entries = []
        specs = self.computer_data['specs'] if self.computer_data else [{'label': '', 'value': ''} for _ in range(4)]

        for i in range(4):
            spec_frame = ctk.CTkFrame(scroll_frame)
            spec_frame.pack(fill="x", pady=5)

            ctk.CTkLabel(spec_frame, text=f"Spec {i+1}:", width=60).pack(side="left", padx=5)

            label_entry = ctk.CTkEntry(spec_frame, width=150, placeholder_text="CPU")
            label_entry.pack(side="left", padx=5)

            value_entry = ctk.CTkEntry(spec_frame, width=350, placeholder_text="Intel Core i7-12700K")
            value_entry.pack(side="left", padx=5)

            if i < len(specs):
                label_entry.insert(0, specs[i]['label'])
                value_entry.insert(0, specs[i]['value'])

            self.spec_entries.append((label_entry, value_entry))

        # Buttons
        button_frame = ctk.CTkFrame(self)
        button_frame.pack(fill="x", padx=20, pady=10)

        btn_save = ctk.CTkButton(button_frame, text="Save",
                                command=self.save,
                                fg_color="green", hover_color="darkgreen",
                                width=150, height=40)
        btn_save.pack(side="left", padx=10)

        btn_cancel = ctk.CTkButton(button_frame, text="Cancel",
                                   command=self.cancel,
                                   width=150, height=40)
        btn_cancel.pack(side="left", padx=10)

    def update_category_options(self):
        """Update category options based on selected type."""
        # Clear existing radio buttons
        if self.category_radio_1:
            self.category_radio_1.destroy()
        if self.category_radio_2:
            self.category_radio_2.destroy()

        computer_type = self.type_var.get()

        if computer_type == "desktop":
            # Desktop options: Custom Build / Refurbished
            self.category_radio_1 = ctk.CTkRadioButton(
                self.cat_frame, text="Custom Build",
                variable=self.category_var, value="custom"
            )
            self.category_radio_1.pack(side="left", padx=10)

            self.category_radio_2 = ctk.CTkRadioButton(
                self.cat_frame, text="Refurbished",
                variable=self.category_var, value="refurbished"
            )
            self.category_radio_2.pack(side="left", padx=10)

            # Set default for desktop if current value is invalid
            if self.category_var.get() not in ["custom", "refurbished"]:
                self.category_var.set("custom")

        else:  # laptop
            # Laptop options: New / Refurbished
            self.category_radio_1 = ctk.CTkRadioButton(
                self.cat_frame, text="New",
                variable=self.category_var, value="new"
            )
            self.category_radio_1.pack(side="left", padx=10)

            self.category_radio_2 = ctk.CTkRadioButton(
                self.cat_frame, text="Refurbished",
                variable=self.category_var, value="refurbished"
            )
            self.category_radio_2.pack(side="left", padx=10)

            # Set default for laptop if current value is invalid
            if self.category_var.get() not in ["new", "refurbished"]:
                self.category_var.set("refurbished")

    def upload_image(self):
        """Handle image upload."""
        file_path = filedialog.askopenfilename(
            title="Select Image",
            filetypes=[
                ("Image files", "*.jpg *.jpeg *.png *.gif *.bmp"),
                ("All files", "*.*")
            ]
        )

        if file_path:
            self.new_image_path = file_path
            self.image_label.configure(text=os.path.basename(file_path))
            self.show_image_preview(file_path)

    def show_image_preview(self, image_path):
        """Show preview of selected image."""
        try:
            img = Image.open(image_path)
            img.thumbnail((300, 300))
            photo = ctk.CTkImage(light_image=img, dark_image=img,
                               size=(min(img.width, 300), min(img.height, 300)))
            self.image_preview_label.configure(image=photo, text="")
            self.image_preview_label.image = photo
        except Exception as e:
            print(f"Error showing preview: {e}")

    def validate_fields(self):
        """Validate all form fields."""
        errors = []

        if not self.name_entry.get().strip():
            errors.append("Computer name is required")

        if not self.price_entry.get().strip():
            errors.append("Price is required")

        # Check if price has $ symbol
        price = self.price_entry.get().strip()
        if not price.startswith('$'):
            errors.append("Price must start with $")

        # Check if at least one spec is filled
        has_spec = False
        for label_entry, value_entry in self.spec_entries:
            if label_entry.get().strip() and value_entry.get().strip():
                has_spec = True
                break

        if not has_spec:
            errors.append("At least one specification is required")

        # Check image
        if not self.computer_data and not self.new_image_path:
            errors.append("Image is required for new computers")

        if errors:
            messagebox.showerror("Validation Error", "\n".join(errors))
            return False

        return True

    def save(self):
        """Save the computer data."""
        if not self.validate_fields():
            return

        # Prepare data
        computer_type = self.type_var.get()
        category = self.category_var.get()
        computer_id = self.id_var.get()

        # Handle image
        if self.new_image_path:
            # Process and save image
            image_filename = f"{computer_type}-{computer_id}.jpg"
            image_dest = self.parent.gallery_dir / image_filename

            try:
                # Open and optimize image
                img = Image.open(self.new_image_path)

                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')

                # Resize if too large (max 1200px on longest side)
                max_size = 1200
                if max(img.size) > max_size:
                    ratio = max_size / max(img.size)
                    new_size = tuple(int(dim * ratio) for dim in img.size)
                    img = img.resize(new_size, Image.Resampling.LANCZOS)

                # Save with optimization
                img.save(image_dest, 'JPEG', quality=85, optimize=True)

                image_path = f"./assets/gallery/{image_filename}"

            except Exception as e:
                messagebox.showerror("Image Error", f"Failed to process image:\n{str(e)}")
                return
        else:
            # Keep existing image
            image_path = self.computer_data['image'] if self.computer_data else ""

        # Collect specs
        specs = []
        for label_entry, value_entry in self.spec_entries:
            label = label_entry.get().strip()
            value = value_entry.get().strip()
            if label and value:
                specs.append({'label': label, 'value': value})

        # Ensure we have exactly 4 specs (pad with empty if needed)
        while len(specs) < 4:
            specs.append({'label': '', 'value': ''})

        # Badge text based on category
        if category == "custom":
            badge_text = "Custom Build"
        elif category == "new":
            badge_text = "New"
        else:  # refurbished
            badge_text = "Refurbished"

        # Create result
        self.result = {
            'id': computer_id,
            'type': computer_type,
            'category': category,
            'title': self.name_entry.get().strip(),
            'price': self.price_entry.get().strip(),
            'image': image_path,
            'badge_text': badge_text,
            'specs': specs
        }

        self.destroy()

    def cancel(self):
        """Cancel the dialog."""
        self.result = None
        self.destroy()


def main():
    """Main entry point."""
    app = GalleryManager()
    app.mainloop()


if __name__ == "__main__":
    main()
