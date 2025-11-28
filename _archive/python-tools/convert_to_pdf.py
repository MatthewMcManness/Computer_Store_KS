"""
Convert RepairShopr Integration Proposal markdown to PDF
Uses markdown2 for parsing and reportlab for PDF generation
"""

import markdown2
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from html.parser import HTMLParser
import re

class MarkdownToPDF:
    def __init__(self, markdown_file, output_file):
        self.markdown_file = markdown_file
        self.output_file = output_file
        self.story = []

        # Create styles
        self.styles = getSampleStyleSheet()

        # Custom styles
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

        self.styles.add(ParagraphStyle(
            name='CustomHeading1',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))

        self.styles.add(ParagraphStyle(
            name='CustomHeading2',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#374151'),
            spaceAfter=8,
            spaceBefore=8,
            fontName='Helvetica-Bold'
        ))

        self.styles.add(ParagraphStyle(
            name='CustomHeading3',
            parent=self.styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor('#4b5563'),
            spaceAfter=6,
            spaceBefore=6,
            fontName='Helvetica-Bold'
        ))

        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.HexColor('#374151'),
            alignment=TA_JUSTIFY,
            spaceAfter=8,
            leading=14
        ))

        self.styles.add(ParagraphStyle(
            name='CustomBullet',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.HexColor('#374151'),
            leftIndent=20,
            bulletIndent=10,
            spaceAfter=6,
            leading=14
        ))

        self.styles.add(ParagraphStyle(
            name='MetaInfo',
            parent=self.styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#6b7280'),
            alignment=TA_CENTER,
            spaceAfter=6
        ))

    def parse_markdown(self):
        """Read and parse the markdown file"""
        with open(self.markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Split into lines for processing
        lines = content.split('\n')

        i = 0
        while i < len(lines):
            line = lines[i].strip()

            # Skip empty lines
            if not line:
                i += 1
                continue

            # Main title (first H1)
            if line.startswith('# ') and i < 5:
                title = line[2:].strip()
                self.story.append(Paragraph(title, self.styles['CustomTitle']))
                self.story.append(Spacer(1, 0.2 * inch))
                i += 1
                continue

            # H2 headings
            if line.startswith('## '):
                heading = line[3:].strip()
                self.story.append(Spacer(1, 0.1 * inch))
                self.story.append(Paragraph(heading, self.styles['CustomHeading1']))
                i += 1
                continue

            # H3 headings
            if line.startswith('### '):
                heading = line[4:].strip()
                self.story.append(Paragraph(heading, self.styles['CustomHeading2']))
                i += 1
                continue

            # H4 headings
            if line.startswith('#### '):
                heading = line[5:].strip()
                self.story.append(Paragraph(heading, self.styles['CustomHeading3']))
                i += 1
                continue

            # Horizontal rules
            if line.startswith('---'):
                self.story.append(Spacer(1, 0.2 * inch))
                i += 1
                continue

            # Bullet points
            if line.startswith('- ') or line.startswith('* '):
                bullet_text = line[2:].strip()
                # Handle bold text
                bullet_text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', bullet_text)
                bullet_text = re.sub(r'__(.+?)__', r'<b>\1</b>', bullet_text)
                # Handle italic text
                bullet_text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', bullet_text)
                bullet_text = re.sub(r'_(.+?)_', r'<i>\1</i>', bullet_text)

                self.story.append(Paragraph(f'• {bullet_text}', self.styles['CustomBullet']))
                i += 1
                continue

            # Tables
            if '|' in line and i + 1 < len(lines) and '|' in lines[i + 1]:
                table_data = []
                # Collect table rows
                while i < len(lines) and '|' in lines[i]:
                    row = [cell.strip() for cell in lines[i].split('|')[1:-1]]
                    # Skip separator rows
                    if not all(cell.replace('-', '').strip() == '' for cell in row):
                        table_data.append(row)
                    i += 1

                if table_data:
                    # Create table
                    table = Table(table_data)
                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e0e7ff')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 11),
                        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 1), (-1, -1), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dbeafe')),
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fb')])
                    ]))
                    self.story.append(table)
                    self.story.append(Spacer(1, 0.2 * inch))
                continue

            # Code blocks (simplified)
            if line.startswith('```'):
                i += 1
                code_lines = []
                while i < len(lines) and not lines[i].strip().startswith('```'):
                    code_lines.append(lines[i])
                    i += 1
                if code_lines:
                    code_text = '\n'.join(code_lines)
                    self.story.append(Paragraph(f'<font name="Courier" size="9">{code_text}</font>', self.styles['CustomBody']))
                    self.story.append(Spacer(1, 0.1 * inch))
                i += 1
                continue

            # Meta information (first few lines with **)
            if line.startswith('**') and ':' in line and i < 10:
                self.story.append(Paragraph(line.replace('**', '<b>').replace('**', '</b>'), self.styles['MetaInfo']))
                i += 1
                continue

            # Regular paragraphs
            if line:
                # Handle bold text
                line = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', line)
                line = re.sub(r'__(.+?)__', r'<b>\1</b>', line)
                # Handle italic text
                line = re.sub(r'\*(.+?)\*', r'<i>\1</i>', line)
                line = re.sub(r'_(.+?)_', r'<i>\1</i>', line)
                # Handle inline code
                line = re.sub(r'`(.+?)`', r'<font name="Courier">\1</font>', line)

                self.story.append(Paragraph(line, self.styles['CustomBody']))

            i += 1

    def generate_pdf(self):
        """Generate the PDF document"""
        doc = SimpleDocTemplate(
            self.output_file,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )

        # Parse markdown and build story
        self.parse_markdown()

        # Build PDF
        doc.build(self.story)
        print(f"✅ PDF generated successfully: {self.output_file}")

if __name__ == "__main__":
    converter = MarkdownToPDF(
        "RepairShopr-Integration-Proposal.md",
        "RepairShopr-Integration-Proposal.pdf"
    )
    converter.generate_pdf()
