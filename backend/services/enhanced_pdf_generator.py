# Enhanced Simple PDF Generator with Valuation Bars (like webapp)
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, Flowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing, Rect, String, Line
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics import renderPDF
from reportlab.pdfgen import canvas
from io import BytesIO
from typing import Dict, Any, Optional
import json
from datetime import datetime

router = APIRouter()

class ValuationBarsDrawing(Flowable):
    """Custom flowable to create valuation bars like the webapp"""
    
    def __init__(self, current_price: float, dcf_value: float, eps_value: float, width: int = 500, height: int = 180):
        self.current_price = current_price
        self.dcf_value = dcf_value
        self.eps_value = eps_value
        self.width = width
        self.height = height
        
    def draw(self):
        # Calculate maximum value for scaling
        max_val = max(self.current_price, self.dcf_value, self.eps_value) * 1.1
        
        # Bar dimensions - increased spacing to prevent overlap
        bar_width = 70
        bar_spacing = 150
        start_x = 60
        start_y = 60  # Adjusted for smaller height
        max_bar_height = self.height - 100  # Adjusted for smaller height
        
        canvas = self.canv
        
        # Title
        canvas.setFont("Helvetica-Bold", 14)
        title_text = "Investment Opportunity Analysis"
        title_width = len(title_text) * 7
        canvas.drawString(self.width//2 - title_width//2, self.height - 25, title_text)
        
        # Calculate percentages
        dcf_pct = ((self.dcf_value - self.current_price) / self.current_price * 100) if self.current_price > 0 else 0
        eps_pct = ((self.eps_value - self.current_price) / self.current_price * 100) if self.current_price > 0 else 0
        
        # Draw bars
        bars_data = [
            {
                'label': 'Current\nPrice',
                'value': self.current_price,
                'color': colors.HexColor('#64748b'),  # Gray like webapp
                'percentage': f'Rs{self.current_price:.0f}',
                'status': 'Market\nPrice'
            },
            {
                'label': 'DCF Fair Value',
                'value': self.dcf_value,
                'color': colors.HexColor('#10b981'),  # Green like webapp
                'percentage': f'Rs{self.dcf_value:.0f}',
                'status': 'DCF Fair\nValue'
            },
            {
                'label': 'EPS Fair Value', 
                'value': self.eps_value,
                'color': colors.HexColor('#8b5cf6'),  # Purple like webapp
                'percentage': f'Rs{self.eps_value:.0f}',
                'status': 'EPS Fair\nValue'
            }
        ]
        
        for i, bar_data in enumerate(bars_data):
            x = start_x + i * bar_spacing
            
            # Calculate bar height proportional to value
            bar_height = (bar_data['value'] / max_val) * max_bar_height
            
            # Draw bar
            canvas.setFillColor(bar_data['color'])
            canvas.rect(x, start_y, bar_width, bar_height, fill=1, stroke=0)
            
            # Add value label on top of bar (centered properly)
            canvas.setFillColor(colors.white)
            canvas.setFont("Helvetica-Bold", 9)
            value_text = f"Rs{bar_data['value']:.0f}"
            text_width = len(value_text) * 5
            canvas.drawString(x + (bar_width - text_width)//2, start_y + bar_height + 8, value_text)
            
            # Add percentage below bar
            canvas.setFillColor(colors.black)
            canvas.setFont("Helvetica-Bold", 10)
            
            # Show actual values for all bars
            display_text = bar_data['percentage']
            text_width = len(display_text) * 5
            canvas.drawString(x + (bar_width - text_width)//2, start_y - 15, display_text)
            
            # Add label below percentage (centered, multi-line)
            canvas.setFont("Helvetica", 8)
            label_lines = bar_data['status'].split('\n')
            for j, line in enumerate(label_lines):
                line_width = len(line) * 4
                canvas.drawString(x + (bar_width - line_width)//2, start_y - 35 - j*12, line)

class EnhancedPDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Create custom styles for consistent formatting"""
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=1,  # Center
            textColor=colors.darkblue
        )
        
        self.section_style = ParagraphStyle(
            'SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=15,
            spaceBefore=20,
            textColor=colors.darkgreen,
            borderWidth=1,
            borderColor=colors.grey,
            borderPadding=5,
            backColor=colors.lightgrey
        )
        
        self.summary_style = ParagraphStyle(
            'Summary',
            parent=self.styles['Normal'],
            fontSize=11,
            leftIndent=20,
            rightIndent=20,
            spaceAfter=15,
            backColor=colors.lightyellow,
            borderWidth=1,
            borderColor=colors.orange,
            borderPadding=10
        )

    # ---------- Financial Health Helpers ----------
    def _extract_number(self, v, default=0.0):
        """Handles scalar-or-list numbers gracefully."""
        if v is None:
            return default
        if isinstance(v, list):
            return v[0] if v else default
        return v

    def _flag_for_metric(self, metric: str, val: float):
        """
        Returns (status, bgcolor_hex, textcolor) based on your RAG rules.
        Rules per your app (Green / Amber / Red):
          • ROE, ROCE:   >=15 green, 11–15 amber, <11 red
          • PEG:         <1 green, 1–1.5 amber, >1.5 red
          • Debt/Equity: <0.8 green, 0.8–2 amber, >2 red
          • TTM P/E:     <30 green, 30–50 amber, >50 red
          • TTM P/B:     <2 green, 2–4 amber, >4 red
          • Rev CAGR 3Y: >=15 green, 8–15 amber, <8 red
        """
        metric = metric.upper()
        if metric in ('ROE', 'ROCE'):
            status = 'Green' if val >= 15 else 'Amber' if 11 <= val < 15 else 'Red'
        elif metric == 'PEG RATIO' or metric == 'PEG':
            status = 'Green' if val < 1 else 'Amber' if 1 <= val <= 1.5 else 'Red'
        elif metric in ('DEBT_TO_EQUITY', 'DEBT/EQUITY'):
            status = 'Green' if val < 0.8 else 'Amber' if 0.8 <= val <= 2 else 'Red'
        elif metric in ('TTM PE', 'TTM P/E', 'TTM_PE'):
            status = 'Green' if val < 30 else 'Amber' if 30 <= val <= 50 else 'Red'
        elif metric in ('TTM PB', 'TTM P/B', 'TTM_PB'):
            status = 'Green' if val < 2 else 'Amber' if 2 <= val <= 4 else 'Red'
        elif metric in ('REV CAGR (3Y)', 'REVENUE_CAGR_3Y', 'REVENUE_CAGR_3Y_PCT'):
            status = 'Green' if val >= 15 else 'Amber' if 8 <= val < 15 else 'Red'
        else:
            status = 'Amber'  # default neutral

        # Colors (soft pastels that print nicely)
        if status == 'Green':
            return ('Green', '#d1fae5', colors.black)   # mint
        if status == 'Amber':
            return ('Amber', '#fef3c7', colors.black)   # light amber
        return ('Red', '#fee2e2', colors.black)         # light red

    def _build_financial_health_section(self, metrics: dict):
        """
        Builds the Financial Health Review table + overall verdict.
        Expects keys aligned with your app:
          - roe, roce, peg_ratio, debt_to_equity, ttm_pe, ttm_pb, revenue_cagr_3y
        """
        from reportlab.platypus import Table, TableStyle, Spacer, Paragraph
        rows = []

        # Collect metric rows (label, value_str, rule_str, status)
        def add_row(label, key, fmt='{:.1f}', suffix=''):
            raw = metrics.get(key)
            val = self._extract_number(raw, None)
            if val is None:
                rows.append([label, 'N/A', '—', 'N/A'])
                return 0  # no score
            try:
                val_f = float(val)
            except Exception:
                rows.append([label, 'N/A', '—', 'N/A'])
                return 0

            # Pretty value
            value_str = (fmt.format(val_f) + suffix).strip()

            # Rules & flag
            status, bg_hex, text_color = self._flag_for_metric(label.upper(), val_f)
            rule_str = {
                'ROE': '≥15% green; 11–15% amber; <11% red',
                'ROCE': '≥15% green; 11–15% amber; <11% red',
                'PEG RATIO': '<1 green; 1–1.5 amber; >1.5 red',
                'DEBT/EQUITY': '<0.8 green; 0.8–2 amber; >2 red',
                'TTM P/E': '<30 green; 30–50 amber; >50 red',
                'TTM P/B': '<2 green; 2–4 amber; >4 red',
                'REV CAGR (3Y)': '≥15% green; 8–15% amber; <8% red',
            }.get(label.upper(), '')

            rows.append([label, value_str, rule_str, status, bg_hex, text_color])
            # Score: Green=2, Amber=1, Red=0
            return 2 if status == 'Green' else 1 if status == 'Amber' else 0

        score = 0
        max_score = 0

        score += add_row('ROE', 'roe', '{:.1f}', '%');               max_score += 2
        score += add_row('ROCE', 'roce', '{:.1f}', '%');             max_score += 2
        score += add_row('PEG Ratio', 'peg_ratio', '{:.2f}');        max_score += 2
        score += add_row('Debt/Equity', 'debt_to_equity', '{:.2f}'); max_score += 2
        score += add_row('TTM P/E', 'ttm_pe', '{:.1f}');             max_score += 2
        score += add_row('TTM P/B', 'ttm_pb', '{:.1f}');             max_score += 2
        score += add_row('Rev CAGR (3Y)', 'revenue_cagr_3y', '{:.1f}', '%'); max_score += 2

        # Build a display table hiding helper color columns
        display_rows = [['Metric', 'Value', 'Rule', 'Status']]
        for label, value_str, rule_str, status, bg_hex, text_color in rows:
            display_rows.append([label, value_str, rule_str, status])

        table = Table(display_rows, colWidths=[1.8*inch, 1.0*inch, 3.2*inch, 1.0*inch])
        style_cmds = [
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e5e7eb')),
            ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]

        # Apply per-row background for Status cell
        for idx, row in enumerate(rows, start=1):  # start=1 due to header
            _, _, _, status, bg_hex, text_color = row
            style_cmds.append(('BACKGROUND', (3, idx), (3, idx), colors.HexColor(bg_hex)))
            style_cmds.append(('TEXTCOLOR', (3, idx), (3, idx), text_color))
            style_cmds.append(('ALIGN', (3, idx), (3, idx), 'CENTER'))
            style_cmds.append(('FONTNAME', (3, idx), (3, idx), 'Helvetica-Bold'))

        table.setStyle(TableStyle(style_cmds))

        # Overall verdict
        pct = (score / max_score * 100) if max_score else 0
        if pct >= 70:
            verdict = ('Strong', colors.HexColor('#d1fae5'), colors.black)
        elif pct >= 40:
            verdict = ('Moderate', colors.HexColor('#fef3c7'), colors.black)
        else:
            verdict = ('Weak', colors.HexColor('#fee2e2'), colors.black)

        verdict_label = Paragraph(
            f"<b>Overall Financial Health:</b> {verdict[0]} (Score: {score}/{max_score}, {pct:.0f}%)",
            self.styles['Normal']
        )
        verdict_box = Table([[verdict_label]], colWidths=[6.0*inch])
        verdict_box.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), verdict[1]),
            ('TEXTCOLOR', (0, 0), (-1, -1), verdict[2]),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor('#e5e7eb')),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))

        parts = []
        parts.append(Paragraph("Financial Health Review", self.section_style))
        parts.append(Spacer(1, 6))
        parts.append(table)
        parts.append(Spacer(1, 10))
        parts.append(verdict_box)
        parts.append(Spacer(1, 16))
        return parts

    def create_header_footer(self, canvas, doc):
        """Add header and footer to each page"""
        # Header
        canvas.saveState()
        canvas.setFont('Helvetica-Bold', 10)
        canvas.drawString(30, A4[1] - 30, "Financial Analysis Report")
        canvas.drawString(A4[0] - 150, A4[1] - 30, f"Generated: {datetime.now().strftime('%Y-%m-%d')}")
        
        # Footer
        canvas.drawString(30, 30, "Confidential - For Internal Use Only")
        canvas.drawString(A4[0] - 100, 30, f"Page {doc.page}")
        canvas.restoreState()

    def create_valuation_bars_chart(self, current_price: float, dcf_value: float, eps_value: float) -> ValuationBarsDrawing:
        """Create the valuation bars chart like webapp"""
        return ValuationBarsDrawing(current_price, dcf_value, eps_value)

    def create_simple_chart(self, data: Dict[str, float], title: str, width: int = 400, height: int = 200):
        """Create a simple bar chart"""
        drawing = Drawing(width, height)
        
        chart = VerticalBarChart()
        chart.x = 50
        chart.y = 50
        chart.height = height - 100
        chart.width = width - 100
        
        # Prepare data
        chart_data = [list(data.values())]
        chart.data = chart_data
        chart.categoryAxis.categoryNames = list(data.keys())
        
        # Styling
        chart.valueAxis.valueMin = 0
        chart.valueAxis.valueMax = max(data.values()) * 1.2 if data.values() else 100
        chart.bars[0].fillColor = colors.lightblue
        chart.bars[0].strokeColor = colors.blue
        
        # Title
        drawing.add(String(width//2, height-30, title, fontSize=12, fillColor=colors.black, textAnchor='middle'))
        drawing.add(chart)
        
        return drawing

    def generate_pdf(self, data: Dict[str, Any], template_type: str = "standard") -> bytes:
        """Generate enhanced PDF with multiple features"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4, 
            topMargin=1*inch,
            bottomMargin=1*inch,
            leftMargin=0.75*inch,
            rightMargin=0.75*inch
        )
        
        content = []
        
        # TITLE PAGE
        company_name = data.get('companyInfo', {}).get('name', 'Company Analysis')
        content.append(Paragraph(f"{company_name}", self.title_style))
        content.append(Spacer(1, 30))
        content.append(Paragraph("Financial Analysis Report", self.styles['Heading1']))
        content.append(Spacer(1, 20))
        content.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y')}", self.styles['Normal']))
        content.append(PageBreak())
        
        # EXECUTIVE SUMMARY (if available)
        if 'executiveSummary' in data:
            content.append(Paragraph("Executive Summary", self.section_style))
            summary = data['executiveSummary']
            
            # Investment recommendation with color coding
            recommendation = summary.get('recommendation', 'HOLD')
            rec_color = colors.green if recommendation == 'BUY' else colors.red if recommendation == 'SELL' else colors.orange
            
            rec_style = ParagraphStyle('Recommendation', parent=self.styles['Normal'], 
                                     fontSize=14, textColor=rec_color, alignment=1)
            content.append(Paragraph(f"Investment Recommendation: <b>{recommendation}</b>", rec_style))
            content.append(Spacer(1, 15))
            
            # Key highlights
            if 'highlights' in summary:
                highlights_text = "Key Investment Highlights:<br/>"
                for key, value in summary['highlights'].items():
                    highlights_text += f"• {key}: {value}<br/>"
                content.append(Paragraph(highlights_text, self.summary_style))
            
            content.append(Spacer(1, 20))
        
        # COMPANY INFORMATION
        if 'companyInfo' in data:
            content.append(Paragraph("Company Information", self.section_style))
            company = data['companyInfo']
            
            # Basic info table
            company_data = []
            if company.get('name'):
                company_data.append(['Company Name', company['name']])
            if company.get('ticker'):
                company_data.append(['Ticker Symbol', company['ticker']])
            if company.get('sector'):
                company_data.append(['Sector', company['sector']])
            if company.get('industry'):
                company_data.append(['Industry', company['industry']])
            if company.get('currentPrice'):
                company_data.append(['Current Price', f"Rs{company['currentPrice']:.2f}"])
            if company.get('marketCap'):
                company_data.append(['Market Cap', f"Rs{company['marketCap']:,.0f} Cr"])
            
            if company_data:
                table = Table(company_data, colWidths=[2.5*inch, 3.5*inch])
                table.setStyle(self.get_table_style('info'))
                content.append(table)
                content.append(Spacer(1, 20))
            
            # Company description
            if company.get('description'):
                content.append(Paragraph("Company Description", self.styles['Heading3']))
                content.append(Paragraph(company['description'], self.styles['Normal']))
                content.append(Spacer(1, 20))
        
        # VALUATION ANALYSIS - Only bars, no tables
        if 'valuationResults' in data:
            content.append(Paragraph("Valuation Analysis", self.section_style))
            content.append(Spacer(1, 15))
            
            valuation = data['valuationResults']
            
            # Extract values for visual bars
            current_price = data.get('metrics', {}).get('current_price', 373)  # default example
            
            dcf_value = 0
            if 'dcf' in valuation:
                dcf_data = valuation['dcf']
                dcf_value = dcf_data.get('dcf_fair_value', 1142.75)  # default example
            
            eps_value = 0
            if 'eps' in valuation:
                eps_data = valuation['eps']
                eps_value = eps_data.get('eps_fair_value', 1039.26)  # default example
            
            # Add the visual bars chart (like webapp) - NO TABLES AT ALL
            if current_price > 0 and dcf_value > 0 and eps_value > 0:
                bars_chart = self.create_valuation_bars_chart(current_price, dcf_value, eps_value)
                content.append(bars_chart)
                content.append(Spacer(1, 15))
                
                # Calculate percentages for summary
                dcf_pct = ((dcf_value - current_price) / current_price) * 100
                eps_pct = ((eps_value - current_price) / current_price) * 100
                avg_upside = (dcf_pct + eps_pct) / 2
                
                # Determine valuation status
                if avg_upside > 20:
                    valuation_status = "Undervalued"
                elif avg_upside > -10:
                    valuation_status = "Fairly Valued"
                else:
                    valuation_status = "Overvalued"
                
                # Create summary text
                dcf_direction = "higher" if dcf_pct > 0 else "lower"
                eps_direction = "higher" if eps_pct > 0 else "lower"
                avg_direction = "upside" if avg_upside > 0 else "downside"
                
                summary_text = f"""
                1. DCF Fair Value is {abs(dcf_pct):.1f}% {dcf_direction} than Current Value.<br/>
                2. EPS Fair Value is {abs(eps_pct):.1f}% {eps_direction} than Current Value.<br/>
                3. Average {avg_direction} is {abs(avg_upside):.1f}%<br/>
                4. Based on the data stock appears to be {valuation_status}.<br/><br/>
                
                <i>DCF Fair Value is calculated based on Assumptions below and EPS Fair Value is calculated 
                3 years projected EPS and 20 PE.</i>
                """
                
                summary_style = ParagraphStyle(
                    'Summary',
                    parent=self.styles['Normal'],
                    fontSize=10,
                    leftIndent=20,
                    rightIndent=20,
                    spaceAfter=15,
                    textColor=colors.HexColor('#374151'),
                    leading=14
                )
                
                content.append(Paragraph(summary_text, summary_style))
            
            content.append(Spacer(1, 20))
        
        # ASSUMPTIONS - Explicit items for better control
        if 'assumptions' in data:
            content.append(Paragraph("DCF/EPS Projection Model Assumptions", self.section_style))
            assumptions = data['assumptions']
            
            assumption_data = []
            
            # Base Revenue
            if assumptions.get('base_revenue'):
                base_revenue = assumptions['base_revenue']
                if isinstance(base_revenue, list):
                    base_revenue = base_revenue[0] if base_revenue else 0
                assumption_data.append(['Base Revenue', f"Rs{base_revenue:,.0f} Cr"])

            # Net Debt
            if assumptions.get('latest_net_debt'):
                latest_net_debt = assumptions['latest_net_debt']
                if isinstance(latest_net_debt, list):
                    latest_net_debt = latest_net_debt[0] if latest_net_debt else 0
                assumption_data.append(['Net Debt', f"Rs{latest_net_debt:,.0f} Cr"])

            # EBIT Margin
            if assumptions.get('ebit_margin'):
                ebit_margin = assumptions['ebit_margin']
                if isinstance(ebit_margin, list):
                    ebit_margin = ebit_margin[0] if ebit_margin else 0
                assumption_data.append(['EBIT Margin', f"{ebit_margin:.1f}%"])

            # Tax Rate
            if assumptions.get('tax_rate'):
                tax_rate = assumptions['tax_rate']
                if isinstance(tax_rate, list):
                    tax_rate = tax_rate[0] if tax_rate else 0
                assumption_data.append(['Tax Rate as % of EBIT', f"{tax_rate:.1f}%"])

            # Capex Percentage
            if assumptions.get('capex_pct'):
                capex = assumptions['capex_pct']
                if isinstance(capex, list):
                    capex = capex[0] if capex else 0
                assumption_data.append(['Capex% of Revenue', f"{capex:.1f}%"])

            # Depreciation Percentage
            if assumptions.get('depreciation_pct'):
                depreciation = assumptions['depreciation_pct']
                if isinstance(depreciation, list):
                    depreciation = depreciation[0] if depreciation else 0
                assumption_data.append(['Depreciation % of Revenue', f"{depreciation:.1f}%"])

            # interest_exp_pct
            if assumptions.get('interest_exp_pct'):
                interest_exp_pct = assumptions['interest_exp_pct']
                if isinstance(interest_exp_pct, list):
                    interest_exp_pct = interest_exp_pct[0] if interest_exp_pct else 0
                assumption_data.append(['Interest Expense % of EBIT', f"{interest_exp_pct:.1f}%"])
            
            
            # Working Capital Change
            if assumptions.get('wc_change_pct'):
                wc_change = assumptions['wc_change_pct']
                if isinstance(wc_change, list):
                    wc_change = wc_change[0] if wc_change else 0
                assumption_data.append(['Working Capital Change %', f"{wc_change:.1f}%"])


            # Revenue Growth Rate 3 years
            if assumptions.get('growth_x'):
                growth_rate = assumptions['growth_x']
                if isinstance(growth_rate, list):
                    growth_rate = growth_rate[0] if growth_rate else 0
                assumption_data.append(['Revenue Growth Rate for first 3 years', f"{growth_rate:.1f}%"])
            
            # Revenue Growth Rate 3 to 10 years
            if assumptions.get('growth_y'):
                growth_rate = assumptions['growth_y']
                if isinstance(growth_rate, list):
                    growth_rate = growth_rate[0] if growth_rate else 0
                assumption_data.append(['Revenue Growth Rate from 3 to 10 years', f"{growth_rate:.1f}%"])

            # Terminal Growth Rate
            if assumptions.get('growth_terminal'):
                terminal_rate = assumptions['growth_terminal']
                if isinstance(terminal_rate, list):
                    terminal_rate = terminal_rate[0] if terminal_rate else 0
                assumption_data.append(['Terminal Growth Rate', f"{terminal_rate:.1f}%"])
            
            
            # WACC (Weighted Average Cost of Capital)
            if assumptions.get('interest_pct'):
                wacc = assumptions['interest_pct']
                if isinstance(wacc, list):
                    wacc = wacc[0] if wacc else 0
                assumption_data.append(['Weighted Average Cost of Capital ', f"{wacc:.1f}%"])
            
            
            # Shares Outstanding
            if assumptions.get('shares_outstanding'):
                shares = assumptions['shares_outstanding']
                if isinstance(shares, list):
                    shares = shares[0] if shares else 0
                assumption_data.append(['Shares Outstanding', f"{shares:.2f} Cr"])
            
            if assumption_data:
                table = Table(assumption_data, colWidths=[3*inch, 2*inch])
                table.setStyle(self.get_table_style('assumptions'))
                content.append(table)
                content.append(Spacer(1, 20))
        
        # KEY METRICS - Grid format like webapp
        if 'metrics' in data:
            content.append(Paragraph("Key Financial Metrics", self.section_style))
            metrics = data['metrics']
            
            # Create a 4-column grid layout
            metrics_grid = []
            
            # Row 1
            row1 = []

            # Enterprise Value = Market Cap + Net Debt (from assumptions if present)
            net_debt_val = 0
            assumptions_for_ev = data.get('assumptions', {})
            if assumptions_for_ev:
                _nd = self._extract_number(assumptions_for_ev.get('latest_net_debt'), 0)
                try:
                    net_debt_val = float(_nd)
                except Exception:
                    net_debt_val = 0

            # Market Cap (also used for EV)
            mc_val_for_ev = self._extract_number(metrics.get('market_cap'), None)
            if mc_val_for_ev is not None:
                ev_val = (mc_val_for_ev or 0) + net_debt_val
                row1.append(['Enterprise Value (Cr)', f"Rs{ev_val:,.0f}"])
            else:
                row1.append(['Enterprise Value (Cr)', 'N/A'])
                
            # Market Cap
            if metrics.get('market_cap'):
                mc_val = metrics['market_cap']
                if isinstance(mc_val, list):
                    mc_val = mc_val[0] if mc_val else 0
                row1.append(['Market Cap (Cr)', f"Rs{mc_val:,.0f}"])
            else:
                row1.append(['Market Cap (Cr)', 'N/A'])
                
            # Book Value
            if metrics.get('book_value'):
                bv_val = metrics['book_value']
                if isinstance(bv_val, list):
                    bv_val = bv_val[0] if bv_val else 0
                row1.append(['Book Value', f"Rs{bv_val:.0f}"])
            else:
                row1.append(['Book Value', 'N/A'])
                
            # 52W H/L
            if metrics.get('high_52w') and metrics.get('low_52w'):
                high_val = metrics['high_52w']
                low_val = metrics['low_52w']
                if isinstance(high_val, list):
                    high_val = high_val[0] if high_val else 0
                if isinstance(low_val, list):
                    low_val = low_val[0] if low_val else 0
                row1.append(['52W H/L', f"Rs{high_val:.2f} / Rs{low_val:.2f}"])
            else:
                row1.append(['52W H/L', 'N/A'])
            
            # Row 2
            row2 = []
            # TTM P/E
            if metrics.get('ttm_pe'):
                pe_val = metrics['ttm_pe']
                if isinstance(pe_val, list):
                    pe_val = pe_val[0] if pe_val else 0
                row2.append(['TTM P/E', f"{pe_val:.1f}"])
            else:
                row2.append(['TTM P/E', 'N/A'])

            # TTM P/B
            if metrics.get('ttm_pb'):
                pb_val = metrics['ttm_pb']
                if isinstance(pb_val, list):
                    pb_val = pb_val[0] if pb_val else 0
                row2.append(['TTM P/B', f"{pb_val:.1f}"])
            else:
                row2.append(['TTM P/B', 'N/A'])
                
            # PEG Ratio
            if metrics.get('peg_ratio'):
                peg_val = metrics['peg_ratio']
                if isinstance(peg_val, list):
                    peg_val = peg_val[0] if peg_val else 0
                row2.append(['PEG Ratio', f"{peg_val:.2f}"])
            else:
                row2.append(['PEG Ratio', 'N/A'])
                
            # EPS CAGR (3Y)
            if metrics.get('eps_cagr_3y'):
                eps_cagr_val = metrics['eps_cagr_3y']
                if isinstance(eps_cagr_val, list):
                    eps_cagr_val = eps_cagr_val[0] if eps_cagr_val else 0
                row2.append(['EPS CAGR (3Y)', f"{eps_cagr_val:.1f}%"])
            else:
                row2.append(['EPS CAGR (3Y)', 'N/A'])
                
            # Row 3
            row3 = []
            # ROCE
            if metrics.get('roce'):
                roce_val = metrics['roce']
                if isinstance(roce_val, list):
                    roce_val = roce_val[0] if roce_val else 0
                row3.append(['ROCE', f"{roce_val:.1f}%"])
            else:
                row3.append(['ROCE', 'N/A'])
                
            # ROE
            if metrics.get('roe'):
                roe_val = metrics['roe']
                if isinstance(roe_val, list):
                    roe_val = roe_val[0] if roe_val else 0
                row3.append(['ROE', f"{roe_val:.1f}%"])
            else:
                row3.append(['ROE', 'N/A'])
                
            # Debt/Equity
            if metrics.get('debt_to_equity'):
                de_val = metrics['debt_to_equity']
                if isinstance(de_val, list):
                    de_val = de_val[0] if de_val else 0
                row3.append(['Debt/Equity', f"{de_val:.2f}"])
            else:
                row3.append(['Debt/Equity', 'N/A'])
                
            # Rev CAGR (3Y)
            if metrics.get('revenue_cagr_3y'):
                rev_cagr_val = metrics['revenue_cagr_3y']
                if isinstance(rev_cagr_val, list):
                    rev_cagr_val = rev_cagr_val[0] if rev_cagr_val else 0
                row3.append(['Rev CAGR (3Y)', f"{rev_cagr_val:.1f}%"])
            else:
                row3.append(['Rev CAGR (3Y)', 'N/A'])
            
            # Row 4
            row4 = []
            # Quick Ratio
            if metrics.get('quick_ratio'):
                qr_val = metrics['quick_ratio']
                if isinstance(qr_val, list):
                    qr_val = qr_val[0] if qr_val else 0
                row4.append(['Quick Ratio', f"{qr_val:.2f}"])
            else:
                row4.append(['Quick Ratio', 'N/A'])
                
            # Price to Sales
            if metrics.get('price_to_sales'):
                ps_val = metrics['price_to_sales']
                if isinstance(ps_val, list):
                    ps_val = ps_val[0] if ps_val else 0
                row4.append(['Price to Sales', f"{ps_val:.2f}"])
            else:
                row4.append(['Price to Sales', 'N/A'])
                
            # EV to EBIT
            if metrics.get('ev_to_ebit'):
                ev_ebit_val = metrics['ev_to_ebit']
                if isinstance(ev_ebit_val, list):
                    ev_ebit_val = ev_ebit_val[0] if ev_ebit_val else 0
                row4.append(['EV to EBIT', f"{ev_ebit_val:.1f}"])
            else:
                row4.append(['EV to EBIT', 'N/A'])
                
            # Current Ratio
            if metrics.get('current_ratio'):
                cr_val = metrics['current_ratio']
                if isinstance(cr_val, list):
                    cr_val = cr_val[0] if cr_val else 0
                row4.append(['Current Ratio', f"{cr_val:.2f}"])
            else:
                row4.append(['Current Ratio', 'N/A'])
            
            # Row 5 (last row)
            row5 = []
            # Empty cells to balance layout
            row5.append(['', ''])
            row5.append(['', ''])
            row5.append(['', ''])
            
            # Dividend Yield
            if metrics.get('div_yield'):
                div_val = metrics['div_yield']
                if isinstance(div_val, list):
                    div_val = div_val[0] if div_val else 0
                row5.append(['Dividend Yield', f"{div_val:.2f}%"])
            else:
                row5.append(['Dividend Yield', 'N/A'])
            
            # Create the grid table data (pairwise mini-tables)
            all_metrics = row1 + row2 + row3 + row4
            for i in range(0, len(all_metrics), 2):
                row_data = []
                if i < len(all_metrics):
                    row_data.append([all_metrics[i][0], all_metrics[i][1]])
                if i + 1 < len(all_metrics):
                    row_data.append([all_metrics[i+1][0], all_metrics[i+1][1]])
                
                if row_data:
                    # Create table for this row
                    table_data = []
                    if len(row_data) >= 1:
                        table_data.append([row_data[0][0], row_data[0][1], 
                                         row_data[1][0] if len(row_data) > 1 else '', 
                                         row_data[1][1] if len(row_data) > 1 else ''])
                    
                    if table_data:
                        metric_table = Table(table_data, colWidths=[2.2*inch, 1.3*inch, 2.2*inch, 1.3*inch])
                        metric_table.setStyle(TableStyle([
                            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                            ('FONTSIZE', (0, 0), (-1, -1), 9),
                            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                            ('TOPPADDING', (0, 0), (-1, -1), 8),
                            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                        ]))
                        content.append(metric_table)
            
            content.append(Spacer(1, 20))

            # --- FINANCIAL HEALTH REVIEW (RAG like webapp) ---
            metrics_for_health = data.get('metrics') or {}
            content.extend(self._build_financial_health_section(metrics_for_health))
        
        # DISCLAIMER
        content.append(Paragraph("Risk Factors & Disclaimer", self.section_style))
        disclaimer_text = """
        <b>Important Disclaimers:</b><br/>
        • This analysis is for informational purposes only and should not be considered as investment advice.<br/>
        • All valuations are based on assumptions and estimates that may not reflect actual future performance.<br/>
        • Past performance is not indicative of future results.<br/>
        • Please consult with a qualified financial advisor before making investment decisions.<br/>
        • The company's stock price may be volatile and subject to market risks.<br/><br/>
        
        <b>Key Risks:</b> Market volatility, regulatory changes, competitive pressures, economic conditions, and 
        company-specific factors may significantly impact valuation.
        """
        content.append(Paragraph(disclaimer_text, self.styles['Normal']))
        
        # Build PDF with header/footer
        doc.build(content, onFirstPage=self.create_header_footer, onLaterPages=self.create_header_footer)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    
    def get_table_style(self, table_type: str) -> TableStyle:
        """Get predefined table styles"""
        base_style = [
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]
        
        if table_type == 'info':
            base_style.extend([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
                ('BACKGROUND', (1, 0), (1, -1), colors.white),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.darkblue),
            ])
        elif table_type == 'valuation':
            base_style.extend([
                ('BACKGROUND', (0, 0), (0, -1), colors.darkgreen),
                ('BACKGROUND', (1, 0), (1, -1), colors.lightgreen),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.white),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ])
        elif table_type == 'assumptions':
            base_style.extend([
                ('BACKGROUND', (0, 0), (0, -1), colors.darkorange),
                ('BACKGROUND', (1, 0), (1, -1), colors.lightyellow),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.white),
            ])
        elif table_type == 'metrics':
            base_style.extend([
                ('BACKGROUND', (0, 0), (0, -1), colors.purple),
                ('BACKGROUND', (1, 0), (1, -1), colors.lavender),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.white),
            ])
        
        return TableStyle(base_style)

# Initialize generator
pdf_generator = EnhancedPDFGenerator()

@router.post("/generate-enhanced-report")
async def generate_enhanced_report(data: Dict[str, Any]):
    """Enhanced endpoint with visual bars matching webapp"""
    try:
        template_type = data.get('template_type', 'standard')
        pdf_bytes = pdf_generator.generate_pdf(data, template_type)
        
        # Create descriptive filename
        company_name = data.get('companyInfo', {}).get('name', 'Report')
        ticker = data.get('companyInfo', {}).get('ticker', '')
        filename = f"{company_name.replace(' ', '_')}_{ticker}_Report.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(pdf_bytes))
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhanced PDF generation failed: {str(e)}")

@router.post("/preview-report-sections")
async def preview_report_sections(data: Dict[str, Any]):
    """Preview what sections will be included in the report"""
    sections = {}
    
    if 'companyInfo' in data and data['companyInfo'].get('name'):
        sections['company_info'] = True
    if 'executiveSummary' in data:
        sections['executive_summary'] = True
    if 'valuationResults' in data:
        sections['valuation'] = True
    if 'assumptions' in data:
        sections['assumptions'] = True
    if 'metrics' in data:
        sections['metrics'] = True
        sections['financial_health'] = True  # NEW
    
    return {"sections": sections, "total_sections": len(sections)}
