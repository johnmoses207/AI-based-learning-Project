import os
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import datetime

# Certificates storage path
CERTIFICATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "certificates")
os.makedirs(CERTIFICATE_DIR, exist_ok=True)

class CertificateGenerator:
    def __init__(self):
        self.width, self.height = landscape(A4)
        # Use standard fonts for now, optionally load custom ones if available
        # pdfmetrics.registerFont(TTFont('CustomFont', 'path/to/font.ttf'))

    def generate(self, student_name, course_name, score, unique_id, issue_date=None):
        if issue_date is None:
            issue_date = datetime.datetime.now().strftime("%B %d, %Y")
        
        filename = f"{unique_id}.pdf"
        filepath = os.path.join(CERTIFICATE_DIR, filename)
        
        c = canvas.Canvas(filepath, pagesize=landscape(A4))
        
        # Draw Background (Soft Gradient effect using lines)
        self._draw_background(c)
        
        # Draw Border
        self._draw_border(c)
        
        # Draw Header
        self._draw_header(c)
        
        # Draw Content
        self._draw_content(c, student_name, course_name, score, issue_date)
        
        # Draw Footer (ID and Signature placeholders)
        self._draw_footer(c, unique_id)
        
        c.save()
        return filepath

    def _draw_background(self, c):
        # Very subtle gradient simulation or solid light cream color
        c.setFillColor(HexColor("#FAFAFA")) # Light cream/white
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        
        # Add a subtle geometric pattern or watermark if needed
        c.saveState()
        c.setStrokeColor(HexColor("#E0E0E0"))
        c.setLineWidth(1)
        # Draw some decorative huge circles for background texture
        c.circle(0, 0, 100, stroke=1, fill=0)
        c.circle(self.width, self.height, 150, stroke=1, fill=0)
        c.restoreState()

    def _draw_border(self, c):
        # Outer Gold Border
        c.setStrokeColor(HexColor("#D4AF37")) # Gold
        c.setLineWidth(5)
        c.rect(10*mm, 10*mm, self.width-20*mm, self.height-20*mm)
        
        # Inner Blue Border
        c.setStrokeColor(HexColor("#003366")) # Dark Blue
        c.setLineWidth(2)
        c.rect(12*mm, 12*mm, self.width-24*mm, self.height-24*mm)
        
        # Corner ornaments (simple lines for elegance)
        c.setStrokeColor(HexColor("#D4AF37"))
        c.setLineWidth(3)
        corner_len = 30
        margin = 10*mm
        # Top-Left
        c.line(margin, margin+corner_len, margin, margin)
        c.line(margin, margin, margin+corner_len, margin)
        # Top-Right
        c.line(self.width-margin-corner_len, margin, self.width-margin, margin)
        c.line(self.width-margin, margin, self.width-margin, margin+corner_len)
        # Bottom-Right
        c.line(self.width-margin, self.height-margin-corner_len, self.width-margin, self.height-margin)
        c.line(self.width-margin-corner_len, self.height-margin, self.width-margin, self.height-margin)
        # Bottom-Left
        c.line(margin, self.height-margin-corner_len, margin, self.height-margin)
        c.line(margin, self.height-margin, margin+corner_len, self.height-margin)

    def _draw_header(self, c):
        c.setFont("Helvetica-Bold", 40)
        c.setFillColor(HexColor("#003366")) # Dark Blue
        c.drawCentredString(self.width/2, self.height - 50*mm, "CERTIFICATE")
        
        c.setFont("Helvetica", 14)
        c.setFillColor(HexColor("#666666"))
        c.drawCentredString(self.width/2, self.height - 65*mm, "OF COMPLETION")

    def _draw_content(self, c):
        raise NotImplementedError("Use specific method signature")
        
    def _draw_content(self, c, student, course, score, date):
        # "This is to certify that"
        c.setFont("Helvetica-Oblique", 12)
        c.setFillColor(colors.black)
        c.drawCentredString(self.width/2, self.height - 85*mm, "This is to certify that")
        
        # Student Name
        c.setFont("Times-BoldItalic", 36) # Classic Academic Font look
        c.setFillColor(HexColor("#D4AF37")) # Goldish
        c.drawCentredString(self.width/2, self.height - 100*mm, student)
        
        # Line under name
        c.setStrokeColor(HexColor("#333333"))
        c.setLineWidth(0.5)
        c.line(self.width/2 - 100*mm, self.height - 102*mm, self.width/2 + 100*mm, self.height - 102*mm)
        
        # "Has successfully completed the course"
        c.setFont("Helvetica", 12)
        c.setFillColor(colors.black)
        c.drawCentredString(self.width/2, self.height - 120*mm, "has successfully completed the course")
        
        # Course Name
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(HexColor("#003366"))
        c.drawCentredString(self.width/2, self.height - 135*mm, course)
        
        # Score/Grade
        if score:
            c.setFont("Helvetica", 12)
            c.setFillColor(colors.black)
            c.drawCentredString(self.width/2, self.height - 150*mm, f"Score: {score}")

    def _draw_footer(self, c, unique_id):
        # Date and Signature lines
        y_pos = 40*mm
        
        # Date
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.black)
        c.line(40*mm, y_pos, 90*mm, y_pos)
        c.drawCentredString(65*mm, y_pos - 5*mm, "Date Issued")
        # Draw actual date above line in content phase or here if passed. 
        # (Already drawn in content? No, let's draw date here)
        # Re-fetching date logic is messy without passing it. Let's assume it's done or I add text here.
        # Actually I missed adding the date text above the line.
        # Let's fix _draw_content to pass date here or draw it here.
        # I'll just write "Date Issued" label. The date value was passed to _draw_content, I should render it there or save it to self.
        
        # Signature
        c.line(self.width - 90*mm, y_pos, self.width - 40*mm, y_pos)
        c.drawCentredString(self.width - 65*mm, y_pos - 5*mm, "Instructor Signature")
        
        # Seal Placeholders
        c.setStrokeColor(HexColor("#D4AF37"))
        c.setLineWidth(2)
        c.circle(self.width/2, y_pos + 10*mm, 20*mm, stroke=1, fill=0)
        c.setFont("Times-Bold", 8)
        c.setFillColor(HexColor("#D4AF37"))
        c.drawCentredString(self.width/2, y_pos + 10*mm, "OFFICIAL SEAL")
        
        # Certificate ID
        c.setFont("Courier", 8)
        c.setFillColor(colors.grey)
        c.drawCentredString(self.width/2, 15*mm, f"Certificate ID: {unique_id}")
        c.drawCentredString(self.width/2, 12*mm, "Verify at: https://eduverse.com/verify")

    # Override generate to specific implementation details correction
    def generate(self, student_name, course_name, score, unique_id, issue_date=None):
        if issue_date is None:
            issue_date = datetime.datetime.now().strftime("%B %d, %Y")
        elif isinstance(issue_date, datetime.datetime):
            issue_date = issue_date.strftime("%B %d, %Y")
            
        filename = f"{unique_id}.pdf"
        filepath = os.path.join(CERTIFICATE_DIR, filename)
        
        c = canvas.Canvas(filepath, pagesize=landscape(A4))
        
        self._draw_background(c)
        self._draw_border(c)
        self._draw_header(c)
        
        # Content
        c.setFont("Helvetica-Oblique", 12)
        c.setFillColor(colors.black)
        c.drawCentredString(self.width/2, self.height - 85*mm, "This is to certify that")
        
        c.setFont("Times-BoldItalic", 36)
        c.setFillColor(HexColor("#D4AF37"))
        c.drawCentredString(self.width/2, self.height - 100*mm, student_name)
        
        c.setStrokeColor(HexColor("#333333"))
        c.setLineWidth(0.5)
        c.line(self.width/2 - 100*mm, self.height - 102*mm, self.width/2 + 100*mm, self.height - 102*mm)
        
        c.setFont("Helvetica", 12)
        c.setFillColor(colors.black)
        c.drawCentredString(self.width/2, self.height - 120*mm, "has successfully completed the course")
        
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(HexColor("#003366"))
        c.drawCentredString(self.width/2, self.height - 135*mm, course_name)
        
        if score:
            c.setFont("Helvetica", 12)
            c.setFillColor(colors.black)
            c.drawCentredString(self.width/2, self.height - 150*mm, f"Score: {score}")

        # Footer items (Date and ID)
        y_pos = 40*mm
        c.setFont("Helvetica", 12)
        c.drawCentredString(65*mm, y_pos + 2*mm, issue_date)

        self._draw_footer(c, unique_id)
        
        c.save()
        return filepath
