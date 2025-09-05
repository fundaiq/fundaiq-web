"""
Enhanced Valuation Analysis Flowables with FundalQ Branding
Phase 2: Professional visualizations for valuation analysis
"""

from reportlab.platypus import Flowable, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import math

# FundalQ Brand Colors
class FundalQColors:
    NAVY_PRIMARY = '#1a2332'
    BLUE_ACCENT = '#1e90ff'
    TEAL_SUCCESS = '#00d4aa'
    WHITE = '#ffffff'
    LIGHT_GRAY = '#f8fafc'
    MEDIUM_GRAY = '#64748b'
    DARK_GRAY = '#334155'
    SUCCESS_BG = '#ecfdf5'
    SUCCESS_BORDER = '#10b981'
    WARNING_BG = '#fef3c7'
    WARNING_BORDER = '#f59e0b'
    DANGER_BG = '#fee2e2'
    DANGER_BORDER = '#ef4444'

def _fmt_rs(val: float) -> str:
    """Format currency in Indian Rupees"""
    try:
        return f"Rs{float(val):,.0f}"
    except Exception:
        return "Rs0"

class EnhancedValuationBarsDrawing(Flowable):
    """Enhanced valuation bars with professional styling and clear verdict"""
    
    def __init__(self, current_price: float, dcf_value: float, eps_value: float, 
                 width: int = 540, height: int = 280):
        self.current_price = current_price
        self.dcf_value = dcf_value
        self.eps_value = eps_value
        self.width = width
        self.height = height
        
    def draw(self):
        c = self.canv
        
        # Calculate margins for better layout
        left_margin = 60
        right_margin = 60
        top_margin = 40
        bottom_margin = 100
        
        chart_width = self.width - left_margin - right_margin
        chart_height = self.height - top_margin - bottom_margin
        
        # Calculate scaling
        max_val = max(self.current_price, self.dcf_value, self.eps_value, 1) * 1.1
        bar_width = 80
        bar_spacing = chart_width / 3
        start_x = left_margin + (bar_spacing - bar_width) / 2
        start_y = bottom_margin
        max_bar_height = chart_height
        
        # Title with enhanced styling
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(colors.HexColor(FundalQColors.NAVY_PRIMARY))
        title = "Investment Opportunity Analysis"
        title_width = c.stringWidth(title, "Helvetica-Bold", 16)
        c.drawString((self.width - title_width) / 2, self.height - 25, title)
        
        # Bars data with enhanced colors
        bars = [
            ("Market\nPrice", self.current_price, colors.HexColor(FundalQColors.MEDIUM_GRAY), "Current"),
            ("DCF Fair\nValue", self.dcf_value, colors.HexColor(FundalQColors.TEAL_SUCCESS), "DCF Analysis"),
            ("EPS Fair\nValue", self.eps_value, colors.HexColor(FundalQColors.BLUE_ACCENT), "3yr EPS Proj (PE 20x)"),
        ]
        
        for i, (caption, val, color, subtitle) in enumerate(bars):
            x = start_x + i * bar_spacing
            bar_height = (val / max_val) * max_bar_height if max_val else 0
            
            # Draw bar with gradient effect (simulate with overlays)
            c.setFillColor(color)
            c.rect(x, start_y, bar_width, bar_height, fill=1, stroke=0)
            
            # Add subtle border
            c.setStrokeColor(colors.HexColor(FundalQColors.DARK_GRAY))
            c.setLineWidth(0.5)
            c.rect(x, start_y, bar_width, bar_height, fill=0, stroke=1)
            
            # Value on top of bar with better positioning
            c.setFont("Helvetica-Bold", 11)
            value_text = _fmt_rs(val)
            text_width = c.stringWidth(value_text, "Helvetica-Bold", 11)
            text_x = x + (bar_width - text_width) / 2
            text_y = start_y + bar_height + 8
            
            # White background for value text
            c.setFillColor(colors.white)
            c.roundRect(text_x - 4, text_y - 2, text_width + 8, 16, 2, fill=1, stroke=0)
            c.setFillColor(colors.HexColor(FundalQColors.DARK_GRAY))
            c.drawString(text_x, text_y, value_text)
            
            # Enhanced caption with subtitle
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(colors.HexColor(FundalQColors.NAVY_PRIMARY))
            lines = caption.split("\n")
            for j, line in enumerate(lines):
                line_width = c.stringWidth(line, "Helvetica-Bold", 10)
                c.drawString(x + (bar_width - line_width) / 2, start_y - 25 - j*12, line)
            
            # Subtitle in smaller font
            c.setFont("Helvetica", 8)
            c.setFillColor(colors.HexColor(FundalQColors.MEDIUM_GRAY))
            subtitle_width = c.stringWidth(subtitle, "Helvetica", 8)
            c.drawString(x + (bar_width - subtitle_width) / 2, start_y - 50, subtitle)
        
        # Add verdict section at the bottom
        self._draw_valuation_verdict(c)
    
    def _draw_valuation_verdict(self, c):
        """Draw professional valuation verdict"""
        # Calculate average upside/downside
        dcf_pct = ((self.dcf_value - self.current_price) / self.current_price * 100) if self.current_price else 0
        eps_pct = ((self.eps_value - self.current_price) / self.current_price * 100) if self.current_price else 0
        avg_pct = (dcf_pct + eps_pct) / 2
        
        # Determine verdict
        if avg_pct > 20:
            verdict = "UNDERVALUED"
            verdict_color = colors.HexColor(FundalQColors.SUCCESS_BORDER)
            bg_color = colors.HexColor(FundalQColors.SUCCESS_BG)
            icon = "🟢"
        elif avg_pct < -20:
            verdict = "OVERVALUED"
            verdict_color = colors.HexColor(FundalQColors.DANGER_BORDER)
            bg_color = colors.HexColor(FundalQColors.DANGER_BG)
            icon = "🔴"
        else:
            verdict = "FAIRLY VALUED"
            verdict_color = colors.HexColor(FundalQColors.WARNING_BORDER)
            bg_color = colors.HexColor(FundalQColors.WARNING_BG)
            icon = "🟡"
        
        # Draw verdict box
        verdict_y = 15
        box_height = 25
        box_width = 200
        box_x = (self.width - box_width) / 2
        
        c.setFillColor(bg_color)
        c.roundRect(box_x, verdict_y, box_width, box_height, 4, fill=1, stroke=0)
        
        # Verdict text
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(verdict_color)
        verdict_text = f"{icon} {verdict}"
        verdict_width = c.stringWidth(verdict_text, "Helvetica-Bold", 12)
        c.drawString(box_x + (box_width - verdict_width) / 2, verdict_y + 8, verdict_text)
        
        # Additional info
        if abs(avg_pct) > 1:
            c.setFont("Helvetica", 8)
            c.setFillColor(colors.HexColor(FundalQColors.DARK_GRAY))
            upside_text = f"Based on model: {abs(avg_pct):.1f}% {'upside' if avg_pct > 0 else 'downside'}"
            upside_width = c.stringWidth(upside_text, "Helvetica", 8)
            c.drawString((self.width - upside_width) / 2, verdict_y - 12, upside_text)

class ValuationSummaryTable(Flowable):
    """Professional valuation summary table"""
    
    def __init__(self, current_price: float, dcf_value: float, eps_value: float,
                 width: int = 540, height: int = 140):
        self.current_price = current_price
        self.dcf_value = dcf_value
        self.eps_value = eps_value
        self.width = width
        self.height = height
    
    def draw(self):
        c = self.canv
        
        # Calculate upside/downside percentages
        dcf_pct = ((self.dcf_value - self.current_price) / self.current_price * 100) if self.current_price else 0
        eps_pct = ((self.eps_value - self.current_price) / self.current_price * 100) if self.current_price else 0
        
        # Create table data
        headers = ['Valuation Method', 'Fair Value', 'Current Price', 'Upside/Downside']
        
        #dcf_signal = "🟢 BUY" if dcf_pct > 15 else "🔴 SELL" if dcf_pct < -15 else "🟡 HOLD"
        #eps_signal = "🟢 BUY" if eps_pct > 15 else "🔴 SELL" if eps_pct < -15 else "🟡 HOLD"
        
        data = [
            headers,
            ['DCF Analysis', _fmt_rs(self.dcf_value), _fmt_rs(self.current_price), 
             f"{dcf_pct:+.1f}%"],
            ['EPS Valuation (PE 20x)', _fmt_rs(self.eps_value), _fmt_rs(self.current_price),
             f"{eps_pct:+.1f}%"]
        ]
        
        # Create and style table
        from reportlab.platypus import Table
        
        col_widths = [2.2*inch, 1.3*inch, 1.3*inch, 1.2*inch]
        table = Table(data, colWidths=col_widths, rowHeights=[25, 20, 20])
        
        table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(FundalQColors.NAVY_PRIMARY)),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data styling
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),    # Method names left-aligned
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'), # Values centered
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor(FundalQColors.DARK_GRAY)),
            
            # Borders and padding
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            
            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor(FundalQColors.LIGHT_GRAY)]),
        ]))
        
        # Draw the table
        table.wrapOn(c, self.width, self.height)
        table.drawOn(c, (self.width - sum(col_widths))/2, self.height - 65)

class ValuationGaugeDrawing(Flowable):
    """Professional gauge showing valuation level"""
    
    def __init__(self, current_price: float, fair_value: float, method_name: str = "DCF",
                 width: int = 200, height: int = 120):
        self.current_price = current_price
        self.fair_value = fair_value
        self.method_name = method_name
        self.width = width
        self.height = height
    
    def draw(self):
        c = self.canv
        
        # Calculate upside/downside
        upside_pct = ((self.fair_value - self.current_price) / self.current_price * 100) if self.current_price else 0
        
        # Gauge parameters
        center_x = self.width / 2
        center_y = self.height / 2 + 10
        radius = 45
        
        # Draw gauge background
        c.setStrokeColor(colors.HexColor(FundalQColors.LIGHT_GRAY))
        c.setLineWidth(8)
        c.arc(center_x - radius, center_y - radius, center_x + radius, center_y + radius, 
              0, 180)
        
        # Determine gauge color and position
        if upside_pct > 20:
            gauge_color = colors.HexColor(FundalQColors.SUCCESS_BORDER)
            angle = 30  # Far right (undervalued)
        elif upside_pct > 5:
            gauge_color = colors.HexColor(FundalQColors.TEAL_SUCCESS)
            angle = 60
        elif upside_pct > -5:
            gauge_color = colors.HexColor(FundalQColors.WARNING_BORDER)
            angle = 90  # Center (fair value)
        elif upside_pct > -20:
            gauge_color = colors.HexColor(FundalQColors.WARNING_BORDER)
            angle = 120
        else:
            gauge_color = colors.HexColor(FundalQColors.DANGER_BORDER)
            angle = 150  # Far left (overvalued)
        
        # Draw active gauge portion
        c.setStrokeColor(gauge_color)
        c.setLineWidth(8)
        
        # Calculate arc based on upside percentage
        start_angle = 180 - angle
        c.arc(center_x - radius, center_y - radius, center_x + radius, center_y + radius,
              start_angle, 180)
        
        # Draw needle
        needle_angle = math.radians(angle)
        needle_end_x = center_x + radius * 0.8 * math.cos(needle_angle)
        needle_end_y = center_y + radius * 0.8 * math.sin(needle_angle)
        
        c.setStrokeColor(colors.HexColor(FundalQColors.DARK_GRAY))
        c.setLineWidth(3)
        c.line(center_x, center_y, needle_end_x, needle_end_y)
        
        # Center dot
        c.setFillColor(colors.HexColor(FundalQColors.DARK_GRAY))
        c.circle(center_x, center_y, 4, fill=1, stroke=0)
        
        # Labels
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.HexColor(FundalQColors.MEDIUM_GRAY))
        c.drawCentredText(center_x - radius * 0.7, center_y - radius * 0.3, "Overvalued")
        c.drawCentredText(center_x, center_y - radius * 0.5, "Fair")
        c.drawCentredText(center_x + radius * 0.7, center_y - radius * 0.3, "Undervalued")
        
        # Title and value
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(colors.HexColor(FundalQColors.NAVY_PRIMARY))
        c.drawCentredText(center_x, center_y + radius + 15, f"{self.method_name} Valuation")
        
        c.setFont("Helvetica", 9)
        c.setFillColor(colors.HexColor(FundalQColors.DARK_GRAY))
        upside_text = f"{upside_pct:+.1f}% {'upside' if upside_pct > 0 else 'downside'}"
        c.drawCentredText(center_x, center_y - radius - 15, upside_text)

class CompactValuationCards(Flowable):
    """Compact cards showing key valuation metrics"""
    
    def __init__(self, current_price: float, dcf_value: float, eps_value: float,
                 width: int = 540, height: int = 100):
        self.current_price = current_price
        self.dcf_value = dcf_value
        self.eps_value = eps_value
        self.width = width
        self.height = height
    
    def draw(self):
        c = self.canv
        
        card_width = 170
        card_height = 80
        card_spacing = 10
        start_x = (self.width - (3 * card_width + 2 * card_spacing)) / 2
        start_y = (self.height - card_height) / 2
        
        # Cards data
        dcf_upside = ((self.dcf_value - self.current_price) / self.current_price * 100) if self.current_price else 0
        eps_upside = ((self.eps_value - self.current_price) / self.current_price * 100) if self.current_price else 0
        
        cards = [
            ("Current Price", _fmt_rs(self.current_price), "Market Value", FundalQColors.MEDIUM_GRAY),
            ("DCF Fair Value", _fmt_rs(self.dcf_value), f"{dcf_upside:+.1f}% upside", FundalQColors.TEAL_SUCCESS),
            ("EPS Target", _fmt_rs(self.eps_value), f"{eps_upside:+.1f}% upside", FundalQColors.BLUE_ACCENT)
        ]
        
        for i, (title, value, subtitle, color) in enumerate(cards):
            x = start_x + i * (card_width + card_spacing)
            
            # Draw card background
            c.setFillColor(colors.white)
            c.setStrokeColor(colors.HexColor(color))
            c.setLineWidth(1)
            c.roundRect(x, start_y, card_width, card_height, 6, fill=1, stroke=1)
            
            # Colored top border
            c.setFillColor(colors.HexColor(color))
            c.roundRect(x, start_y + card_height - 4, card_width, 4, 0, fill=1, stroke=0)
            
            # Title
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(colors.HexColor(FundalQColors.NAVY_PRIMARY))
            title_width = c.stringWidth(title, "Helvetica-Bold", 10)
            c.drawString(x + (card_width - title_width) / 2, start_y + card_height - 20, title)
            
            # Value
            c.setFont("Helvetica-Bold", 14)
            c.setFillColor(colors.HexColor(color))
            value_width = c.stringWidth(value, "Helvetica-Bold", 14)
            c.drawString(x + (card_width - value_width) / 2, start_y + card_height - 40, value)
            
            # Subtitle
            c.setFont("Helvetica", 8)
            c.setFillColor(colors.HexColor(FundalQColors.MEDIUM_GRAY))
            subtitle_width = c.stringWidth(subtitle, "Helvetica", 8)
            c.drawString(x + (card_width - subtitle_width) / 2, start_y + card_height - 60, subtitle)