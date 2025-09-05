from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import TableStyle
from reportlab.lib.enums import TA_CENTER

# ---------- FundalQ Brand Colors ----------
class FundalQColors:
    """FundalQ brand color palette"""
    NAVY_PRIMARY = '#1a2332'      # Dark navy - primary brand color
    BLUE_ACCENT = '#1e90ff'       # Bright blue - accent color  
    TEAL_SUCCESS = '#00d4aa'      # Teal - success/growth indicators
    WHITE = '#ffffff'
    LIGHT_GRAY = '#f8fafc'        # Background color
    MEDIUM_GRAY = '#64748b'       # Secondary text
    DARK_GRAY = '#334155'         # Body text
    BORDER_GRAY = '#e2e8f0'       # Borders and dividers
    
    # Enhanced status colors
    SUCCESS_BG = '#ecfdf5'        # Light green background
    SUCCESS_BORDER = '#10b981'    # Green border
    WARNING_BG = '#fef3c7'        # Light yellow background  
    WARNING_BORDER = '#f59e0b'    # Orange border
    DANGER_BG = '#fee2e2'         # Light red background
    DANGER_BORDER = '#ef4444'     # Red border

# ---------- Enhanced Styles with FundalQ Branding ----------
def build_styles():
    styles = getSampleStyleSheet()
    
    # Enhanced section header with FundalQ branding
    section = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=18,
        spaceAfter=16,
        spaceBefore=24,
        textColor=colors.HexColor(FundalQColors.NAVY_PRIMARY),  # FundalQ navy
        borderWidth=0,  # Remove border for cleaner look
        borderColor=colors.HexColor(FundalQColors.BLUE_ACCENT),
        borderPadding=8,
        backColor=colors.HexColor('#f1f5f9'),  # Very light blue-gray
        fontName='Helvetica-Bold',
    )
    
    # Enhanced title with FundalQ branding  
    title = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        spaceAfter=30,
        spaceBefore=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor(FundalQColors.NAVY_PRIMARY),  # FundalQ navy
        fontName='Helvetica-Bold',
    )
    
    # Enhanced summary box with FundalQ styling
    summary = ParagraphStyle(
        'Summary',
        parent=styles['Normal'],
        fontSize=11,
        leftIndent=16,
        rightIndent=16,
        spaceBefore=12,
        spaceAfter=15,
        backColor=colors.HexColor(FundalQColors.LIGHT_GRAY),  # Light gray bg
        borderWidth=1,
        borderColor=colors.HexColor(FundalQColors.BLUE_ACCENT),  # Blue border
        borderPadding=12,
        textColor=colors.HexColor(FundalQColors.DARK_GRAY),
        leading=15,
    )
    
    return styles, section, title, summary

STYLES, SECTION_STYLE, TITLE_STYLE, SUMMARY_STYLE = build_styles()

# ---------- Enhanced Financial Health Colors ----------
FIN_HEALTH_RULES = {
    'ROE':            lambda v: 'Green' if v >= 15 else 'Amber' if 11 <= v < 15 else 'Red',
    'ROCE':           lambda v: 'Green' if v >= 15 else 'Amber' if 11 <= v < 15 else 'Red',
    'PEG RATIO':      lambda v: 'Green' if v < 1 else 'Amber' if 1 <= v <= 1.5 else 'Red',
    'DEBT/EQUITY':    lambda v: 'Green' if v < 0.8 else 'Amber' if 0.8 <= v <= 2 else 'Red',
    'TTM P/E':        lambda v: 'Green' if v < 30 else 'Amber' if 30 <= v <= 50 else 'Red',
    'TTM P/B':        lambda v: 'Green' if v < 2 else 'Amber' if 2 <= v <= 4 else 'Red',
    'REV CAGR (3Y)':  lambda v: 'Green' if v >= 15 else 'Amber' if 8 <= v < 15 else 'Red',
}

FIN_HEALTH_RULE_TEXT = {
    'ROE': '≥15% green; 11–15% amber; <11% red',
    'ROCE': '≥15% green; 11–15% amber; <11% red',
    'PEG RATIO': '<1 green; 1–1.5 amber; >1.5 red',
    'DEBT/EQUITY': '<0.8 green; 0.8–2 amber; >2 red',
    'TTM P/E': '<30 green; 30–50 amber; >50 red',
    'TTM P/B': '<2 green; 2–4 amber; >4 red',
    'REV CAGR (3Y)': '≥15% green; 8–15% amber; <8% red',
}

# Enhanced RAG colors using FundalQ palette
RAG_BG = {
    'Green': FundalQColors.SUCCESS_BG, 
    'Amber': FundalQColors.WARNING_BG, 
    'Red': FundalQColors.DANGER_BG
}

RAG_BORDER = {
    'Green': FundalQColors.SUCCESS_BORDER,
    'Amber': FundalQColors.WARNING_BORDER, 
    'Red': FundalQColors.DANGER_BORDER
}

# ---------- Helper Functions ----------
def safe_num(val, default=0.0):
    """Return first element if list else value."""
    if val is None:
        return default
    if isinstance(val, list):
        return val[0] if val else default
    return val

def fmt_rs(v, decimals=0):
    """Format currency in Indian Rupees"""
    try:
        return f"Rs{float(v):,.{decimals}f}"
    except Exception:
        return "N/A"

def table_style(base_grid=0.5):
    """Enhanced table style with FundalQ branding"""
    return TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # Enhanced styling with FundalQ colors
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor(FundalQColors.DARK_GRAY)),
        ('GRID', (0, 0), (-1, -1), base_grid, colors.HexColor(FundalQColors.BORDER_GRAY)),
        
        # Better padding
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ])

# Enhanced table style functions for better branding
def fundalq_table_style(header_bg=None):
    """Create FundalQ branded table style"""
    if header_bg is None:
        header_bg = FundalQColors.NAVY_PRIMARY
    
    return TableStyle([
        # Basic formatting
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor(FundalQColors.DARK_GRAY)),
        
        # Enhanced header with FundalQ branding
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(header_bg)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        
        # Professional borders and padding
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor(FundalQColors.BORDER_GRAY)),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor(FundalQColors.BORDER_GRAY)),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        
        # Alternating row colors
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), 
         [colors.white, colors.HexColor(FundalQColors.LIGHT_GRAY)]),
    ])

def company_info_table_style():
    """Special branded table for company information"""
    return TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # FundalQ branded label column
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor(FundalQColors.BLUE_ACCENT)),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.white),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        
        # Clean value column
        ('BACKGROUND', (1, 0), (1, -1), colors.white),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor(FundalQColors.DARK_GRAY)),
        
        # Professional spacing
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor(FundalQColors.BORDER_GRAY)),
    ])

# Additional FundalQ styles for special elements
TAGLINE_STYLE = ParagraphStyle(
    'FundalQTagline',
    parent=STYLES['Normal'],
    fontSize=14,
    textColor=colors.HexColor(FundalQColors.MEDIUM_GRAY),
    alignment=TA_CENTER,
    spaceAfter=20,
    fontStyle='italic',
)

BRAND_HEADER_STYLE = ParagraphStyle(
    'FundalQBrandHeader',
    parent=STYLES['Normal'],
    fontSize=11,
    textColor=colors.HexColor(FundalQColors.NAVY_PRIMARY),
    fontName='Helvetica-Bold',
)

BRAND_FOOTER_STYLE = ParagraphStyle(
    'FundalQBrandFooter',
    parent=STYLES['Normal'],
    fontSize=8,
    textColor=colors.HexColor(FundalQColors.MEDIUM_GRAY),
)