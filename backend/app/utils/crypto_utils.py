import hashlib
import os
import qrcode
from io import BytesIO
import reportlab
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def calculate_sha256(content: bytes) -> str:
    """Calculates standard SHA-256 hex string"""
    hasher = hashlib.sha256()
    hasher.update(content)
    return hasher.hexdigest()

def calculate_file_sha256(file_path: str) -> str:
    """Calculates SHA-256 for a stored file"""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def generate_qr_code_image(data_text: str) -> bytes:
    """Generates PNG byte buffer for QR code"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(data_text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()

def generate_default_certificate_pdf(
    student_name: str,
    institution_name: str,
    title: str,
    credential_id: str,
    issue_date_str: str,
    output_path: str
) -> str:
    """Generates a professional certificate PDF when issuer inputs text details"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Background styling / Border
    c.setStrokeColor(colors.HexColor("#3b82f6"))
    c.setLineWidth(4)
    c.rect(20, 20, width - 40, height - 40)
    c.setStrokeColor(colors.HexColor("#1e293b"))
    c.setLineWidth(1)
    c.rect(25, 25, width - 50, height - 50)

    # Header
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(colors.HexColor("#2563eb"))
    c.drawCentredString(width / 2.0, height - 70, "SKILLCHAIN VERIFIED CREDENTIAL")

    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawCentredString(width / 2.0, height - 90, "Cryptographically Anchored on Ethereum Virtual Machine")

    # Certificate Title
    c.setFont("Helvetica-Bold", 26)
    c.setFillColor(colors.HexColor("#0f172a"))
    c.drawCentredString(width / 2.0, height - 150, "CERTIFICATE OF ACHIEVEMENT")

    c.setFont("Helvetica", 12)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(width / 2.0, height - 190, "This is proudly presented to")

    # Recipient
    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(colors.HexColor("#1e40af"))
    c.drawCentredString(width / 2.0, height - 230, student_name)

    c.setFont("Helvetica", 12)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawCentredString(width / 2.0, height - 270, "for successfully demonstrating excellence in")

    # Credential Title
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(colors.HexColor("#0f172a"))
    c.drawCentredString(width / 2.0, height - 310, title)

    # Details
    c.setFont("Helvetica", 11)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawString(60, height - 400, f"Issuing Institution: {institution_name}")
    c.drawString(60, height - 425, f"Date of Issue: {issue_date_str}")
    c.drawString(60, height - 450, f"Credential ID: {credential_id}")

    # Security Notice
    c.setFont("Helvetica-Oblique", 9)
    c.setFillColor(colors.HexColor("#94a3b8"))
    c.drawCentredString(width / 2.0, 50, "Tampering with this document invalidates its SHA-256 on-chain hash registry.")

    c.save()
    return output_path
