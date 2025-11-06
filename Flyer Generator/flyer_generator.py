"""
Sales Flyer Generator
Computer Store Kansas
GUI application for creating PDF sales flyers for laptops and desktops
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import os
from pathlib import Path
import webbrowser
import tempfile

# Try to import xhtml2pdf for PDF generation
try:
    from xhtml2pdf import pisa
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False


class FlyerGeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Computer Store Kansas - Flyer Generator")
        self.root.geometry("600x700")
        self.root.resizable(False, False)
        
        # Set up resource paths
        self.setup_resource_paths()
        
        # Create main container
        main_frame = ttk.Frame(root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Title
        title_label = ttk.Label(main_frame, text="Sales Flyer Generator", 
                                font=('Arial', 16, 'bold'))
        title_label.grid(row=0, column=0, columnspan=2, pady=10)
        
        # Product Type Selection
        type_frame = ttk.LabelFrame(main_frame, text="Product Type", padding="10")
        type_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        self.product_type = tk.StringVar(value="laptop")
        ttk.Radiobutton(type_frame, text="Laptop", variable=self.product_type, 
                       value="laptop", command=self.update_fields).grid(row=0, column=0, padx=20)
        ttk.Radiobutton(type_frame, text="Desktop", variable=self.product_type, 
                       value="desktop", command=self.update_fields).grid(row=0, column=1, padx=20)
        
        # Condition Selection
        condition_frame = ttk.LabelFrame(main_frame, text="Condition", padding="10")
        condition_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        self.condition = tk.StringVar(value="new")
        ttk.Radiobutton(condition_frame, text="New", variable=self.condition, 
                       value="new", command=self.update_warranty_info).grid(row=0, column=0, padx=20)
        ttk.Radiobutton(condition_frame, text="Refurbished", variable=self.condition, 
                       value="refurbished", command=self.update_warranty_info).grid(row=0, column=1, padx=20)
        
        # Product Details
        details_frame = ttk.LabelFrame(main_frame, text="Product Details", padding="10")
        details_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        row = 0
        
        # Product Name
        ttk.Label(details_frame, text="Product Name:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.product_name = tk.StringVar()
        ttk.Entry(details_frame, textvariable=self.product_name, width=40).grid(row=row, column=1, pady=5)
        row += 1
        
        # Screen Size / Graphics Card (conditional)
        self.spec1_label = ttk.Label(details_frame, text="Screen Size:")
        self.spec1_label.grid(row=row, column=0, sticky=tk.W, pady=5)
        self.spec1_var = tk.StringVar()
        ttk.Entry(details_frame, textvariable=self.spec1_var, width=40).grid(row=row, column=1, pady=5)
        row += 1
        
        # Processor
        ttk.Label(details_frame, text="Processor:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.processor = tk.StringVar()
        ttk.Entry(details_frame, textvariable=self.processor, width=40).grid(row=row, column=1, pady=5)
        row += 1
        
        # Memory
        ttk.Label(details_frame, text="Memory:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.memory = tk.StringVar()
        ttk.Entry(details_frame, textvariable=self.memory, width=40).grid(row=row, column=1, pady=5)
        row += 1
        
        # Storage
        ttk.Label(details_frame, text="Storage:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.storage = tk.StringVar()
        ttk.Entry(details_frame, textvariable=self.storage, width=40).grid(row=row, column=1, pady=5)
        row += 1
        
        # Price
        ttk.Label(details_frame, text="Price:").grid(row=row, column=0, sticky=tk.W, pady=5)
        self.price = tk.StringVar()
        ttk.Entry(details_frame, textvariable=self.price, width=40).grid(row=row, column=1, pady=5)
        
        # Warranty Info Display
        warranty_frame = ttk.LabelFrame(main_frame, text="Warranty Information", padding="10")
        warranty_frame.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        self.warranty_text = tk.Text(warranty_frame, height=3, width=50, state='disabled', 
                                     wrap=tk.WORD, font=('Arial', 9))
        self.warranty_text.grid(row=0, column=0, pady=5)
        
        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=5, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Preview HTML", 
                  command=self.preview_html, width=20).grid(row=0, column=0, padx=5)
        ttk.Button(button_frame, text="Save as PDF", 
                  command=self.save_pdf, width=20).grid(row=0, column=1, padx=5)
        
        # Initialize display
        self.update_fields()
        self.update_warranty_info()
    
    def setup_resource_paths(self):
        """Set up paths for template files and resources"""
        # Check if we're running as a bundle or as a script
        if getattr(sys, 'frozen', False):
            # Running as compiled executable
            self.base_path = Path(sys._MEIPASS)
        else:
            # Running as script
            self.base_path = Path(__file__).parent
        
        # For now, we'll look for templates in the current directory
        self.templates_dir = self.base_path
    
    def update_fields(self):
        """Update field labels based on product type"""
        if self.product_type.get() == "laptop":
            self.spec1_label.config(text="Screen Size:")
        else:
            self.spec1_label.config(text="Graphics Card:")
        
        self.update_warranty_info()
    
    def update_warranty_info(self):
        """Update warranty information display based on condition and type"""
        product = self.product_type.get()
        condition = self.condition.get()
        
        self.warranty_text.config(state='normal')
        self.warranty_text.delete(1.0, tk.END)
        
        if product == "laptop":
            if condition == "new":
                warranty = "1 Year Manufacturer Warranty\nLifetime Free Diagnostics"
            else:
                warranty = "90 Days Parts Warranty\n6 Months Free Diagnostics"
        else:  # desktop
            if condition == "new":
                warranty = "1 Month Manufacturer Warranty\nLifetime Free Diagnostics"
            else:
                warranty = "3 Months Parts Warranty\n6 Months Free Diagnostics"
        
        self.warranty_text.insert(1.0, warranty)
        self.warranty_text.config(state='disabled')
    
    def get_condition_text(self):
        """Get the display text for the condition"""
        if self.condition.get() == "new":
            return "Brand New"
        else:
            return "Newly Refurbished"
    
    def get_warranty_data(self):
        """Get warranty data for the selected product type and condition"""
        product = self.product_type.get()
        condition = self.condition.get()
        
        if product == "laptop":
            if condition == "new":
                return {
                    'duration1': '1 Year',
                    'type1': 'Manufacturer Warranty',
                    'duration2': 'Lifetime',
                    'type2': 'Free Diagnostics'
                }
            else:
                return {
                    'duration1': '90 Days',
                    'type1': 'Parts Warranty',
                    'duration2': '6 Months',
                    'type2': 'Free Diagnostics'
                }
        else:  # desktop
            if condition == "new":
                return {
                    'duration1': '1 Month',
                    'type1': 'Manufacturer Warranty',
                    'duration2': 'Lifetime',
                    'type2': 'Free Diagnostics'
                }
            else:
                return {
                    'duration1': '3 Months',
                    'type1': 'Parts Warranty',
                    'duration2': '6 Months',
                    'type2': 'Free Diagnostics'
                }
    
    def generate_html(self):
        """Generate HTML content based on current form values"""
        product = self.product_type.get()
        
        # Read the appropriate template
        template_file = f"{product.capitalize()}_sales-flyer.html"
        template_path = self.templates_dir / template_file
        
        if not template_path.exists():
            messagebox.showerror("Error", f"Template file not found: {template_file}")
            return None
        
        with open(template_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Get warranty data
        warranty = self.get_warranty_data()
        
        # Replace placeholders
        replacements = {
            'Type Text': self.get_condition_text(),
            'Name Text': self.product_name.get() or 'Product Name',
            'Product Name': self.product_name.get() or 'Product Name',
            'Screen Size Text': self.spec1_var.get() or 'Screen Size',
            'Graphics Text': self.spec1_var.get() or 'Graphics Card',
            'Processor Text': self.processor.get() or 'Processor',
            'Memory Text': self.memory.get() or 'Memory',
            'Storage Text': self.storage.get() or 'Storage',
            'Price Text': self.price.get() or '$999',
        }
        
        # Apply replacements
        for placeholder, value in replacements.items():
            html_content = html_content.replace(placeholder, value)
        
        # Update warranty information
        if product == "laptop":
            html_content = html_content.replace('1 Year', warranty['duration1'])
            html_content = html_content.replace('Manufacturer Warranty', warranty['type1'])
            html_content = html_content.replace('Lifetime', warranty['duration2'])
            # Handle the second occurrence of Free Diagnostics
            parts = html_content.split('Free Diagnostics', 1)
            if len(parts) > 1:
                html_content = parts[0] + warranty['type2'] + parts[1]
        else:  # desktop
            html_content = html_content.replace('3 Months', warranty['duration1'])
            html_content = html_content.replace('Parts Warranty', warranty['type1'])
            html_content = html_content.replace('6 Months', warranty['duration2'])
            parts = html_content.split('Free Diagnostics', 1)
            if len(parts) > 1:
                html_content = parts[0] + warranty['type2'] + parts[1]
        
        return html_content
    
    def preview_html(self):
        """Generate and open HTML preview in browser"""
        html_content = self.generate_html()
        if not html_content:
            return
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, 
                                        encoding='utf-8') as f:
            temp_path = f.name
            
            # Make paths absolute for images
            base_path = self.templates_dir.absolute()
            html_content = html_content.replace('src="title.png"', 
                                               f'src="file:///{base_path}/title.png"')
            html_content = html_content.replace('src="graphics-icon.png"', 
                                               f'src="file:///{base_path}/graphics-icon.png"')
            html_content = html_content.replace('href="sales-flyer.css"', 
                                               f'href="file:///{base_path}/sales-flyer.css"')
            
            f.write(html_content)
        
        # Open in browser
        webbrowser.open('file://' + temp_path)
    
    def save_pdf(self):
        """Generate and save PDF file"""
        if not PDF_AVAILABLE:
            messagebox.showerror("Error", 
                               "PDF generation requires xhtml2pdf library.\n"
                               "Please install it using: pip install xhtml2pdf")
            return
        
        # Validate inputs
        if not self.product_name.get():
            messagebox.showwarning("Warning", "Please enter a product name")
            return
        
        # Ask for save location
        default_name = f"{self.product_name.get().replace(' ', '_')}_flyer.pdf"
        file_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF files", "*.pdf"), ("All files", "*.*")],
            initialfile=default_name
        )
        
        if not file_path:
            return
        
        try:
            html_content = self.generate_html()
            if not html_content:
                return
            
            # Read CSS file
            css_path = self.templates_dir / "sales-flyer.css"
            if not css_path.exists():
                messagebox.showerror("Error", "CSS file not found")
                return
            
            with open(css_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
            
            # Embed CSS in HTML
            html_with_css = html_content.replace('</head>', f'<style>{css_content}</style></head>')
            
            # Convert images to base64 for embedding
            import base64
            
            # Embed title.png
            title_path = self.templates_dir / "title.png"
            if title_path.exists():
                with open(title_path, 'rb') as f:
                    title_b64 = base64.b64encode(f.read()).decode()
                html_with_css = html_with_css.replace('src="title.png"', 
                                                     f'src="data:image/png;base64,{title_b64}"')
            
            # Embed graphics-icon.png
            graphics_path = self.templates_dir / "graphics-icon.png"
            if graphics_path.exists():
                with open(graphics_path, 'rb') as f:
                    graphics_b64 = base64.b64encode(f.read()).decode()
                html_with_css = html_with_css.replace('src="graphics-icon.png"', 
                                                     f'src="data:image/png;base64,{graphics_b64}"')
            
            # Generate PDF using xhtml2pdf
            with open(file_path, "wb") as pdf_file:
                pisa_status = pisa.CreatePDF(html_with_css, dest=pdf_file)
            
            if pisa_status.err:
                messagebox.showerror("Error", "Failed to generate PDF")
                return
            
            messagebox.showinfo("Success", f"PDF saved successfully!\n{file_path}")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate PDF:\n{str(e)}")


def main():
    root = tk.Tk()
    app = FlyerGeneratorApp(root)
    root.mainloop()


if __name__ == "__main__":
    import sys
    main()
