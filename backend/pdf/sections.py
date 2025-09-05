from __future__ import annotations
from typing import Dict, Any, List
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Spacer, PageBreak, Table, TableStyle,KeepTogether
from reportlab.lib.units import inch
from typing import Dict, Any, List, Tuple, Optional
from reportlab.platypus import LongTable, KeepInFrame
from reportlab.lib.pagesizes import A4
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER,TA_LEFT
from .styles import (
    STYLES, SECTION_STYLE, TITLE_STYLE, SUMMARY_STYLE,
    FIN_HEALTH_RULES, FIN_HEALTH_RULE_TEXT, RAG_BG,
    safe_num, fmt_rs, table_style, FundalQColors, fundalq_table_style,
)
from .flowables import ValuationBarsDrawing
from .enhanced_flowables import (
    EnhancedValuationBarsDrawing, 
    ValuationSummaryTable,
    ValuationGaugeDrawing,
    CompactValuationCards
)


class Sections:
    """Static builders returning arrays of flowables (Paragraph, Table, Spacer...)."""

    @staticmethod
    def header_footer(canv, doc):
        canv.saveState()
        canv.setFont('Helvetica-Bold', 10)
        canv.drawString(30, A4[1] - 30, "Financial Analysis Report")
        canv.drawString(A4[0] - 150, A4[1] - 30, f"Generated: {datetime.now():%Y-%m-%d}")
        canv.drawString(30, 30, "Confidential - For Internal Use Only")
        canv.drawString(A4[0] - 100, 30, f"Page {doc.page}")
        canv.restoreState()

    @staticmethod
    def title_page(data: Dict[str, Any]) -> List:
        company_info = data.get('companyInfo', {})
        company = company_info.get('name', 'Company Analysis')
        parts: List = [
            Paragraph(company, TITLE_STYLE),
            Spacer(1, 30),
            Paragraph("Financial Analysis Report", STYLES['Heading1']),
            Spacer(1, 20),
            Paragraph(f"Generated on: {datetime.now():%B %d, %Y}", STYLES['Normal']),
            Spacer(1, 20),
        ]

        # --- Inline Company Information on first page ---
        if company_info:
            rows = []
            def add(label, key, fmt=None):
                if key in company_info and company_info[key] not in (None, ''):
                    val = company_info[key]
                    if fmt:
                        val = fmt(val)
                    rows.append([label, val])

            add('Company Name', 'name')
            add('Ticker Symbol', 'ticker')
            add('Sector', 'sector')
            add('Industry', 'industry')
            add('Current Price', 'currentPrice', lambda v: f"Rs{float(v):.2f}")
            add('Market Cap', 'marketCap', lambda v: f"Rs{float(v):,.0f} Cr")

            if rows:
                t = Table(rows, colWidths=[2.5 * inch, 3.5 * inch])
                t.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#87CEFA')),  # Light sky blue labels
                    ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#FFFFFF')),  # White values
                    ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#000000')),   # Black text labels
                    ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#000000')),   # Black text values
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),              # Bold labels
                ]))
                parts += [Paragraph("Company Information", STYLES['Heading2']), t, Spacer(1, 20)]

            if company_info.get('description'):
                parts += [
                    Paragraph("Company Description", STYLES['Heading3']),
                    Paragraph(company_info['description'], STYLES['Normal']),
                    Spacer(1, 20),
                ]

        parts.append(PageBreak())
        return parts    

    @staticmethod
    def executive_summary(data: Dict[str, Any]) -> List:
        summary = data.get('executiveSummary')
        if not summary:
            return []
        rec = summary.get('recommendation', 'HOLD')
        rec_color = colors.green if rec == 'BUY' else colors.red if rec == 'SELL' else colors.orange
        rec_style = STYLES['Normal'].clone('Recommendation')
        rec_style.fontSize = 14
        rec_style.textColor = rec_color
        rec_style.alignment = 1

        parts = [
            Paragraph("Executive Summary", SECTION_STYLE),
            Paragraph(f"Investment Recommendation: <b>{rec}</b>", rec_style),
            Spacer(1, 15)
        ]

        if 'highlights' in summary:
            text = "Key Investment Highlights:<br/>"
            for k, v in summary['highlights'].items():
                text += f"• {k}: {v}<br/>"
            parts += [Paragraph(text, SUMMARY_STYLE), Spacer(1, 10)]
        else:
            parts += [Spacer(1, 10)]
        return parts

    # Add these methods to your existing Sections class:

    @staticmethod
    def _create_valuation_method_breakdown(valuation_data: dict, current_price: float, 
                                     dcf_value: float, eps_value: float) -> List:
        """Create detailed breakdown of valuation methods"""
        parts = []
        
        parts.extend([
            Paragraph("Valuation Method", STYLES['Heading3']),
            Spacer(1, 3)
        ])
        
        # DCF Analysis Section
        if dcf_value:
            dcf_upside = ((dcf_value - current_price) / current_price * 100) if current_price else 0
            
            parts.append(Paragraph("💰 DCF (Discounted Cash Flow) Analysis", STYLES['Heading4']))
            
            dcf_summary = f"""
            <b>Method:</b> Values company based on projected future cash flows discounted to present value<br/>
            <b>Fair Value:</b> {fmt_rs(dcf_value)}<br/>
            <b>Current Price:</b> {fmt_rs(current_price)}<br/>
            <b>Potential Upside/Downside:</b> {dcf_upside:+.1f}%<br/>
            <b>Key Assumption:</b> Based on fundamental business performance and cash generation<br/>
            <b>Cashflow Projection:</b> Based on assumptions cashflow projection table is provided below. <br/>
            <b>Sensitivity Analysis:</b> Based on EBIT margin and projected growth sensitivity of DCF Fair Value is shown in sensitiviy table below.
            """
            
            parts.extend([
                Paragraph(dcf_summary, SUMMARY_STYLE),
                Spacer(1, 6)
            ])
        
        # EPS Analysis Section  
        if eps_value:
            eps_upside = ((eps_value - current_price) / current_price * 100) if current_price else 0
            
            parts.append(Paragraph("📊 EPS (Earnings Per Share) Valuation", STYLES['Heading4']))
            
            eps_summary = f"""
            <b>Method:</b> Values company using projected earnings and industry-standard PE ratio (20x)<br/>
            <b>Target Price:</b> {fmt_rs(eps_value)}<br/>
            <b>Current Price:</b> {fmt_rs(current_price)}<br/>
            <b>Potential Upside/Downside:</b> {eps_upside:+.1f}%<br/>
            <b>Key Assumption:</b> PE ratio of 20x reflects fair market valuation for earnings
            """
            
            parts.extend([
                Paragraph(eps_summary, SUMMARY_STYLE),
                Spacer(1, 6)
            ])
        
        # Risk Factors
        parts.extend([
            Paragraph("⚠️ Key Valuation Risks", STYLES['Heading4']),
            Spacer(1, 4)
        ])
        
        risk_factors = """
        • <b>Market Risk:</b> Overall market conditions can affect stock performance regardless of fundamentals<br/>
        • <b>Assumption Risk:</b> Valuations depend on growth, margin, and discount rate assumptions<br/>
        • <b>Execution Risk:</b> Company must deliver projected financial performance<br/>
        • <b>Sector Risk:</b> Industry-specific factors may impact valuation multiples<br/>
        • <b>Liquidity Risk:</b> Market liquidity conditions can affect price realization
        """
        
        parts.extend([
            Paragraph(risk_factors, STYLES['Normal']),
            Spacer(1, 12)
        ])
        
        return parts

    @staticmethod 
    def enhanced_valuation_compact(data: Dict[str, Any]) -> List:
        """Compact version of valuation analysis for executive templates"""
        valuation_data = data.get('valuationResults', {})
        metrics_data = data.get('metrics', {}) or {}
        
        if not valuation_data:
            return []

        parts: List = []
        
        # Extract data
        current_price = safe_num(metrics_data.get('current_price', 0))
        dcf_fair_value = safe_num(valuation_data.get('dcf', {}).get('dcf_fair_value', 0)) or \
                        safe_num(valuation_data.get('dcf_fair_value', 0))
        eps_fair_value = safe_num(valuation_data.get('eps', {}).get('eps_fair_value', 0)) or \
                        safe_num(valuation_data.get('eps_fair_value', 0))

        if not (current_price and (dcf_fair_value or eps_fair_value)):
            return parts

        parts.extend([
            Paragraph("📈 Valuation Summary", SECTION_STYLE),
            Spacer(1, 6)
        ])
        
        # Compact cards view
        if dcf_fair_value and eps_fair_value:
            parts.extend([
                KeepTogether([CompactValuationCards(current_price, dcf_fair_value, eps_fair_value)]),
                Spacer(1, 6)
            ])
        
        # Quick verdict
        dcf_upside = ((dcf_fair_value - current_price) / current_price * 100) if current_price and dcf_fair_value else 0
        eps_upside = ((eps_fair_value - current_price) / current_price * 100) if current_price and eps_fair_value else 0
        avg_upside = (dcf_upside + eps_upside) / 2 if dcf_fair_value and eps_fair_value else (dcf_upside or eps_upside)
        
        if abs(avg_upside) > 5:  # Only show if significant
            verdict_text = f"<b>Model Assessment:</b> Based on the assumptions used, the stock appears "
            if avg_upside > 15:
                verdict_text += f"<b>undervalued</b> with {avg_upside:.1f}% potential upside 🟢"
            elif avg_upside < -15:
                verdict_text += f"<b>overvalued</b> with {abs(avg_upside):.1f}% potential downside 🔴"
            else:
                verdict_text += f"<b>fairly valued</b> near current market levels 🟡"
            
            parts.extend([
                Paragraph(verdict_text, SUMMARY_STYLE),
                Spacer(1, 6)
            ])
        
        return parts

    @staticmethod
    def valuation_gauges_section(data: Dict[str, Any]) -> List:
        """Create gauge-style valuation indicators"""
        valuation_data = data.get('valuationResults', {})
        metrics_data = data.get('metrics', {}) or {}
        
        if not valuation_data:
            return []

        parts: List = []
        
        # Extract data
        current_price = safe_num(metrics_data.get('current_price', 0))
        dcf_fair_value = safe_num(valuation_data.get('dcf', {}).get('dcf_fair_value', 0)) or \
                        safe_num(valuation_data.get('dcf_fair_value', 0))
        eps_fair_value = safe_num(valuation_data.get('eps', {}).get('eps_fair_value', 0)) or \
                        safe_num(valuation_data.get('eps_fair_value', 0))

        if not (current_price and (dcf_fair_value or eps_fair_value)):
            return []

        parts.extend([
            Paragraph("Valuation Indicators", STYLES['Heading3']),
            Spacer(1, 6)
        ])
        
        # Create gauge layout table for side-by-side display
        gauge_content = []
        if dcf_fair_value:
            gauge_content.append([ValuationGaugeDrawing(current_price, dcf_fair_value, "DCF")])
        if eps_fair_value:
            if gauge_content:
                gauge_content[0].append(ValuationGaugeDrawing(current_price, eps_fair_value, "EPS"))
            else:
                gauge_content.append([ValuationGaugeDrawing(current_price, eps_fair_value, "EPS")])
        
        if gauge_content:
            gauge_table = Table(gauge_content, colWidths=[270, 270] if len(gauge_content[0]) == 2 else [540])
            gauge_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            
            parts.extend([
                KeepTogether([gauge_table]),
                Spacer(1, 6)
            ])
        
        return parts


    # Additional utility function for backward compatibility
    @staticmethod
    def enhanced_valuation_legacy_compatible(valuation: Dict[str, Any], metrics: Dict[str, Any]) -> List:
        """Enhanced version that's compatible with existing valuation() method calls"""
        # Convert legacy format to new format
        data = {
            'valuationResults': valuation,
            'metrics': metrics
        }
        return Sections.enhanced_valuation_analysis(data)
    def enhanced_valuation_analysis(data: Dict[str, Any]) -> List:
        """Enhanced valuation analysis with professional visualizations"""
        valuation_data = data.get('valuationResults', {})
        metrics_data = data.get('metrics', {}) or {}
        
        if not valuation_data:
            return []

        parts: List = []
        parts.extend([
            Paragraph("📈 Valuation Analysis", SECTION_STYLE),
            Spacer(1, 6)
        ])

        # Extract valuation data
        current_price = safe_num(metrics_data.get('current_price', 0))
        dcf_fair_value = safe_num(valuation_data.get('dcf', {}).get('dcf_fair_value', 0)) or \
                        safe_num(valuation_data.get('dcf_fair_value', 0))
        eps_fair_value = safe_num(valuation_data.get('eps', {}).get('eps_fair_value', 0)) or \
                        safe_num(valuation_data.get('eps_fair_value', 0))

        if not (current_price and (dcf_fair_value or eps_fair_value)):
            parts.append(Paragraph("⚠️ Insufficient valuation data available.", STYLES['Normal']))
            return parts

        # 1. Enhanced Valuation Overview with Professional Charts
        # parts.extend([
        #     Paragraph("Investment Opportunity Overview", STYLES['Heading3']),
        #     Spacer(1, 6)
        # ])
        
        # Use enhanced valuation bars
        if dcf_fair_value and eps_fair_value:
            parts.extend([
                KeepTogether([EnhancedValuationBarsDrawing(current_price, dcf_fair_value, eps_fair_value)]),
                Spacer(1, 6)
            ])
        
        # 2. Detailed Valuation Comparison Table
        parts.extend([
            Paragraph("Valuation Comparison", STYLES['Heading3']),
            Spacer(1, 6)
        ])
        
        if dcf_fair_value and eps_fair_value:
            parts.extend([
                KeepTogether([ValuationSummaryTable(current_price, dcf_fair_value, eps_fair_value)]),
                Spacer(1, 2)
            ])
        
        # 4. Valuation Method Breakdown
        method_breakdown = Sections._create_valuation_method_breakdown(
            valuation_data, current_price, dcf_fair_value, eps_fair_value
        )
        parts.extend(method_breakdown)
        
        return parts

    @staticmethod
    def _create_investment_verdict(current_price: float, dcf_value: float, eps_value: float) -> List:
        """Create professional investment verdict section"""
        parts = []
        
        # Calculate metrics
        dcf_upside = ((dcf_value - current_price) / current_price * 100) if current_price and dcf_value else 0
        eps_upside = ((eps_value - current_price) / current_price * 100) if current_price and eps_value else 0
        avg_upside = (dcf_upside + eps_upside) / 2 if dcf_value and eps_value else (dcf_upside or eps_upside)
        
        # Determine valuation assessment (NOT investment recommendation)
        if avg_upside > 25:
            verdict = "SIGNIFICANTLY UNDERVALUED"
            verdict_color = FundalQColors.SUCCESS_BORDER
            bg_color = FundalQColors.SUCCESS_BG
            icon = "🟢"
            explanation = "Based on model assumptions, stock appears significantly undervalued"
        elif avg_upside > 10:
            verdict = "UNDERVALUED" 
            verdict_color = FundalQColors.SUCCESS_BORDER
            bg_color = FundalQColors.SUCCESS_BG
            icon = "🟢"
            explanation = "Based on model assumptions, stock appears undervalued"
        elif avg_upside > -10:
            verdict = "FAIRLY VALUED"
            verdict_color = FundalQColors.WARNING_BORDER
            bg_color = FundalQColors.WARNING_BG
            icon = "🟡"
            explanation = "Based on model assumptions, stock appears fairly valued"
        elif avg_upside > -25:
            verdict = "OVERVALUED"
            verdict_color = FundalQColors.WARNING_BORDER
            bg_color = FundalQColors.WARNING_BG
            icon = "🟡"
            explanation = "Based on model assumptions, stock appears moderately overvalued"
        else:
            verdict = "SIGNIFICANTLY OVERVALUED"
            verdict_color = FundalQColors.DANGER_BORDER
            bg_color = FundalQColors.DANGER_BG
            icon = "🔴"
            explanation = "Based on model assumptions, stock appears significantly overvalued"
        
        parts.extend([
            Paragraph("Valuation Assessment", STYLES['Heading3']),
            Spacer(1, 8)
        ])
        
        # Create assessment table
        verdict_data = [[
            f"{icon} {verdict}",
            f"{abs(avg_upside):.1f}% {'Upside' if avg_upside > 0 else 'Downside'}",
            explanation
        ]]
        
        verdict_table = Table(verdict_data, colWidths=[1.5*inch, 1.5*inch, 3.5*inch])
        verdict_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(bg_color)),
            ('TEXTCOLOR', (0, 0), (1, -1), colors.HexColor(verdict_color)),
            ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor(FundalQColors.DARK_GRAY)),
            ('FONTNAME', (0, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (1, -1), 12),
            ('FONTSIZE', (2, 0), (2, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('BOX', (0, 0), (-1, -1), 2, colors.HexColor(verdict_color)),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor(verdict_color)),
        ]))
        
        parts.extend([
            KeepTogether([verdict_table]),
            Spacer(1, 20)
        ])
        
        return parts


    @staticmethod
    def valuation(valuation: Dict[str, Any], metrics: Dict[str, Any]) -> List:
        if not valuation:
            return []
        parts = [Paragraph("Valuation Analysis", SECTION_STYLE), Spacer(1, 15)]

        current_price = safe_num(metrics.get('current_price'), 0) or 0
        dcf_val = safe_num(valuation.get('dcf', {}).get('dcf_fair_value'), 0)
        eps_val = safe_num(valuation.get('eps', {}).get('eps_fair_value'), 0)

        if current_price > 0 and dcf_val > 0 and eps_val > 0:
            parts += [ValuationBarsDrawing(current_price, dcf_val, eps_val), Spacer(1, 15)]

            dcf_pct = (dcf_val - current_price) / current_price * 100
            eps_pct = (eps_val - current_price) / current_price * 100
            avg = (dcf_pct + eps_pct) / 2
            status = "Undervalued" if avg > 20 else "Fairly Valued" if avg > -10 else "Overvalued"
            d_dir = "higher" if dcf_pct > 0 else "lower"
            e_dir = "higher" if eps_pct > 0 else "lower"
            a_dir = "upside" if avg > 0 else "downside"

            summary_text = f"""
                1. DCF Fair Value is {abs(dcf_pct):.1f}% {d_dir} than Current Value.<br/>
                2. EPS Fair Value is {abs(eps_pct):.1f}% {e_dir} than Current Value.<br/>
                3. Average {a_dir} is {abs(avg):.1f}%<br/>
                4. Based on the data stock appears to be {status}.<br/><br/>
                <i>DCF Fair Value is based on assumptions below; EPS Fair Value uses 3-year projected EPS & 20x PE.</i>
            """
            val_style = STYLES['Normal'].clone('ValSummary')
            val_style.fontSize = 10
            val_style.leftIndent = 20
            val_style.rightIndent = 20
            val_style.spaceAfter = 15
            val_style.textColor = colors.HexColor('#374151')
            val_style.leading = 14
            parts.append(Paragraph(summary_text, val_style))

        parts.append(Spacer(1, 20))
        return parts

    @staticmethod
    def assumptions_block(assumptions: Dict[str, Any]) -> List:
        if not assumptions:
            return []
        parts = [Paragraph("DCF/EPS Projection Model Assumptions", SECTION_STYLE)]
        rows = []

        def add(label, key, fmt):
            if key in assumptions and assumptions[key] is not None:
                v = safe_num(assumptions[key], 0)
                rows.append([label, fmt(v)])

        add('Base Revenue', 'base_revenue', lambda v: f"Rs{float(v):,.0f} Cr")
        add('Net Debt', 'latest_net_debt', lambda v: f"Rs{float(v):,.0f} Cr")
        add('EBIT Margin', 'ebit_margin', lambda v: f"{float(v):.1f}%")
        add('Tax Rate as % of EBIT', 'tax_rate', lambda v: f"{float(v):.1f}%")
        add('Capex% of Revenue', 'capex_pct', lambda v: f"{float(v):.1f}%")
        add('Depreciation % of Revenue', 'depreciation_pct', lambda v: f"{float(v):.1f}%")
        add('Interest Expense % of EBIT', 'interest_exp_pct', lambda v: f"{float(v):.1f}%")
        add('Working Capital Change %', 'wc_change_pct', lambda v: f"{float(v):.1f}%")
        add('Revenue Growth (Years 1–3)', 'growth_x', lambda v: f"{float(v):.1f}%")
        add('Revenue Growth (Years 4–10)', 'growth_y', lambda v: f"{float(v):.1f}%")
        add('Terminal Growth Rate', 'growth_terminal', lambda v: f"{float(v):.1f}%")
        add('Weighted Avg Cost of Capital', 'interest_pct', lambda v: f"{float(v):.1f}%")
        add('Shares Outstanding', 'shares_outstanding', lambda v: f"{float(v):.2f} Cr")

        if rows:
            # Group into pairs for 4-column layout
            paired_rows = []
            for i in range(0, len(rows), 2):
                left = rows[i]
                right = rows[i+1] if i+1 < len(rows) else ["", ""]
                paired_rows.append([left[0], left[1], right[0], right[1]])

            t = Table(paired_rows, colWidths=[2.2*inch, 1.3*inch, 2.2*inch, 1.3*inch])

            style = TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                # Backgrounds
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#87CEFA')),  # label col 1
                ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#87CEFA')),  # label col 3
                ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#FFFFFF')),  # value col 2
                ('BACKGROUND', (3, 0), (3, -1), colors.HexColor('#FFFFFF')),  # value col 4
                ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1E3A8A')),  # darker label
                ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#1E3A8A')),
                ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#000000')),  # greenish value
                ('TEXTCOLOR', (3, 0), (3, -1), colors.HexColor('#000000')),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ])
            t.setStyle(style)

            parts += [t, Spacer(1, 20)]
            parts.append(PageBreak())
        return parts

    @staticmethod
    def metrics_grid(metrics: Dict[str, Any], assumptions: Dict[str, Any]) -> List:
        if not metrics:
            return []
        parts = [Paragraph("Key Financial Metrics", SECTION_STYLE)]

        net_debt = float(safe_num(assumptions.get('latest_net_debt'), 0))
        mc = safe_num(metrics.get('market_cap'), None)

        row1, row2, row3, row4, row5 = [], [], [], [], []

        # Row1
        if mc is not None:
            ev = float(mc or 0) + net_debt
            row1.append(['Enterprise Value (Cr)', fmt_rs(ev, 0)])
        else:
            row1.append(['Enterprise Value (Cr)', 'N/A'])

        row1.append(['Market Cap (Cr)', fmt_rs(safe_num(metrics.get('market_cap'), 0), 0)])
        row1.append(['Book Value', f"{safe_num(metrics.get('book_value'), 0):.0f}"])
        if metrics.get('high_52w') and metrics.get('low_52w'):
            row1.append(['52W H/L',
                         f"Rs{safe_num(metrics['high_52w']):.2f} / Rs{safe_num(metrics['low_52w']):.2f}"])
        else:
            row1.append(['52W H/L', 'N/A'])

        # Row2
        row2.append(['TTM P/E', f"{safe_num(metrics.get('ttm_pe'), 0):.1f}"])
        row2.append(['TTM P/B', f"{safe_num(metrics.get('ttm_pb'), 0):.1f}"])
        row2.append(['PEG Ratio', f"{safe_num(metrics.get('peg_ratio'), 0):.2f}"])
        row2.append(['EPS CAGR (3Y)', f"{safe_num(metrics.get('eps_cagr_3y'), 0):.1f}%"])

        # Row3
        row3.append(['ROCE', f"{safe_num(metrics.get('roce'), 0):.1f}%"])
        row3.append(['ROE', f"{safe_num(metrics.get('roe'), 0):.1f}%"])
        row3.append(['Debt/Equity', f"{safe_num(metrics.get('debt_to_equity'), 0):.2f}"])
        row3.append(['Rev CAGR (3Y)', f"{safe_num(metrics.get('revenue_cagr_3y'), 0):.1f}%"])

        # Row4
        row4.append(['Quick Ratio', f"{safe_num(metrics.get('quick_ratio'), 0):.2f}"])
        row4.append(['Price to Sales', f"{safe_num(metrics.get('price_to_sales'), 0):.2f}"])
        row4.append(['EV to EBIT', f"{safe_num(metrics.get('ev_to_ebit'), 0):.1f}"])
        row4.append(['Current Ratio', f"{safe_num(metrics.get('current_ratio'), 0):.2f}"])

        # ---- Pairwise rows into a single 4-column table (Label|Value|Label|Value) ----
        pair_rows = row1 + row2 + row3 + row4
        paired = []
        for i in range(0, len(pair_rows), 2):
            left = pair_rows[i]
            right = pair_rows[i + 1] if i + 1 < len(pair_rows) else ["", ""]
            paired.append([left[0], left[1], right[0], right[1]])

        t = Table(paired, colWidths=[2.2 * inch, 1 * inch, 2.0 * inch, 1.5 * inch])

        style = TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),

            # Backgrounds: label columns vs value columns
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#B0E0E6')),  # Label col 1
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#B0E0E6')),  # Label col 3
            ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#FFFFFF')),  # Value col 2
            ('BACKGROUND', (3, 0), (3, -1), colors.HexColor('#FFFFFF')),  # Value col 4

            # Text colors
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1E3A8A')),
            ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#1E3A8A')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#000000')),
            ('TEXTCOLOR', (3, 0), (3, -1), colors.HexColor('#000000')),

            # Make label columns bold
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),

            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ])
        t.setStyle(style)

        parts += [t, Spacer(1, 20)]
        return parts
    @staticmethod
    def financial_health(metrics: Dict[str, Any]) -> List:
        """
        Mirrors the web Financial Health dashboard:
        1) 📊 Past Growth (Revenue, EBITDA, Net Profit) – bars
        2) 📈 Growth Rates (YoY%) – lines
        3) 💰 Profitability & Returns (Margins, ROE/ROCE) – lines
        4) 🏢 Balance Sheet Snapshot (Equity, Net Debt, Net Block, CWIP) – bars
        5) ⚖️ Leverage & Liquidity (D/E, Interest Coverage, Cash & Bank) – lines
        + existing RAG scorecard + verdict
        """
        if not metrics:
            return []

        from .flowables import BarChartFlowable, LineChartFlowable

        def _listify(x):
            if x is None:
                return []
            return x if isinstance(x, list) else [x]

        # Years arrive as ["Mar-2021", ...] in web, for PDF we accept `metrics.years`
        raw_years = _listify(metrics.get("years"))
        years = [str(y).replace("Mar-", "") for y in raw_years if y is not None]

        parts: List = [Paragraph("Financial Health Review", SECTION_STYLE), Spacer(1, 8)]

        def _align_series_exact(key: str) -> Tuple[List[str], List[float]]:
            data = _listify(metrics.get(key))
            data = [float(d) for d in data if d is not None]
            if not years or not data:
                return [], []
            # match the last K years to the K data points
            k = min(len(years), len(data))
            return years[-k:], data[-k:]

        def _chart_grid(section_title: str, entries: List[Tuple[str, str, str]], percent_keys: Optional[set] = None, per_row: int = 3):
            """entries: list of (label, key, chart_type['bar'|'line'])"""
            if percent_keys is None: percent_keys = set()
            parts.append(Paragraph(section_title, STYLES['Heading3']))
            parts.append(Spacer(1, 4))

            row_cells = []
            col_width = (A4[0] - (0.75 * inch) * 2) / per_row  # rough fit across printable width

            def _mk_cell(flow):
                # Wrap each chart in a one-cell table to keep layout tidy
                t = Table([[flow]], colWidths=[col_width])
                t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
                return t

            count = 0
            for label, key, kind in entries:
                is_percent = key in percent_keys
                y_lbls, series = _align_series_exact(key)   # <- use exact alignment
                if not y_lbls or not series:
                    continue
                flow = BarChartFlowable(label, y_lbls, series, width=int(col_width)-8, height=140, y_is_percent=is_percent) \
                    if kind == 'bar' else \
                    LineChartFlowable(label, y_lbls, series, width=int(col_width)-8, height=140, y_is_percent=is_percent)

                row_cells.append(_mk_cell(flow))
                count += 1

                if count % per_row == 0:
                    parts.append(Table([row_cells], colWidths=[col_width]*per_row, style=table_style(0)))
                    parts.append(Spacer(1, 6))
                    row_cells = []

            if row_cells:
                # pad remaining columns for consistent width
                while len(row_cells) < per_row:
                    row_cells.append(Table([[""]], colWidths=[col_width], style=table_style(0)))
                parts.append(Table([row_cells], colWidths=[col_width]*per_row, style=table_style(0)))
                parts.append(Spacer(1, 8))

        # 1) Past Growth (bars)
        _chart_grid(
            "📊 Past Growth",
            [
                ("Revenue (₹ Cr)", "revenue", "bar"),
                ("EBITDA (₹ Cr)", "ebitda", "bar"),
                ("Net Profit (₹ Cr)", "net_profit", "bar"),
            ],
            percent_keys=set(),
            per_row=3
        )

        # 2) Growth Rates (lines, YoY%)
        _chart_grid(
            "📈 Growth Rates",
            [
                ("Revenue Growth (%)", "revenue_growth", "line"),
                ("EBITDA Growth (%)", "ebitda_growth", "line"),
                ("Net Profit Growth (%)", "net_profit_growth", "line"),
            ],
            percent_keys={"revenue_growth", "ebitda_growth", "net_profit_growth"},
            per_row=3
        )

        # 3) Profitability & Returns (lines, %)
        _chart_grid(
            "💰 Profitability & Returns",
            [
                ("EBITDA Margin (%)", "ebitda_margin", "line"),
                ("Net Profit Margin (%)", "net_profit_margin", "line"),
                ("ROCE (%)", "roce", "line"),
                ("ROE (%)", "roe", "line"),
            ],
            percent_keys={"ebitda_margin", "net_profit_margin", "roce", "roe"},
            per_row=4
        )

        # 4) Balance Sheet Snapshot (bars)
        _chart_grid(
            "🏢 Balance Sheet Snapshot",
            [
                ("Equity (₹ Cr)", "equity", "bar"),
                ("Net Debt (₹ Cr)", "net_debt", "bar"),
                ("Net Block (₹ Cr)", "net_block", "bar"),
                ("Capital WIP (₹ Cr)", "cwip", "bar"),
            ],
            percent_keys=set(),
            per_row=4
        )

        # 5) Leverage & Liquidity (lines)
        _chart_grid(
            "⚖️ Leverage & Liquidity",
            [
                ("Debt/Equity (x)", "debt_to_equity", "line"),
                ("Interest Coverage (x)", "interest_coverage", "line"),
                ("Cash & Bank (₹ Cr)", "cash_and_bank", "line"),
            ],
            percent_keys=set(),
            per_row=3
        )

        # ---- Keep your existing RAG table + verdict exactly as before ----
        items = [
            ('ROE', 'roe', '{:.1f}', '%'),
            ('ROCE', 'roce', '{:.1f}', '%'),
            ('PEG Ratio', 'peg_ratio', '{:.2f}', ''),
            ('Debt/Equity', 'debt_to_equity', '{:.2f}', ''),
            ('TTM P/E', 'ttm_pe', '{:.1f}', ''),
            ('TTM P/B', 'ttm_pb', '{:.1f}', ''),
            ('Rev CAGR (3Y)', 'revenue_cagr_3y', '{:.1f}', '%'),
        ]

        rows, score, max_score = [['Metric', 'Value', 'Rule', 'Status']], 0, len(items) * 2
        rag_cmds = []
        for idx, (label, key, fmt, suf) in enumerate(items, start=1):
            raw = metrics.get(key)
            if raw is None:
                rows.append([label, 'N/A', '—', 'N/A'])
                continue
            try:
                v = float(safe_num(raw, 0))
            except Exception:
                rows.append([label, 'N/A', '—', 'N/A'])
                continue

            val_str = (fmt.format(v) + suf).strip()
            rule_key = label.upper()
            status = FIN_HEALTH_RULES.get(rule_key, lambda x: 'Amber')(v)
            rows.append([label, val_str, FIN_HEALTH_RULE_TEXT.get(rule_key, ''), status])

            score += 2 if status == 'Green' else 1 if status == 'Amber' else 0
            rag_cmds += [
                ('BACKGROUND', (3, idx), (3, idx), colors.HexColor(RAG_BG[status])),
                ('TEXTCOLOR', (3, idx), (3, idx), colors.black),
                ('ALIGN', (3, idx), (3, idx), 'CENTER'),
                ('FONTNAME', (3, idx), (3, idx), 'Helvetica-Bold')
            ]

        t = Table(rows, colWidths=[1.8 * inch, 1.0 * inch, 3.2 * inch, 1.0 * inch])
        base = TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e5e7eb')),
            ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ])
        for cmd in rag_cmds:
            base.add(*cmd)
        t.setStyle(base)

        parts += [Spacer(1, 8), t, Spacer(1, 10), Spacer(1, 16)]
        return parts

    @staticmethod
    def dcf_section(valuation: Dict[str, Any], metrics: Dict[str, Any], assumptions: Dict[str, Any]) -> List:
        """Full DCF: verdict + FCF/DCF table + sensitivity grid."""
        if not valuation or not isinstance(valuation, dict):
            return []

        parts: List = [Paragraph("DCF Valuation Details", SECTION_STYLE), Spacer(1, 8)]

        # ---------- Verdict box (mirror web logic) ----------
        current_price = safe_num(metrics.get('current_price'), 0)
        dcf_val = safe_num(valuation.get('dcf_fair_value'), 0)

        if current_price and dcf_val:
            diff_pct = (dcf_val - current_price) / current_price * 100.0
            if diff_pct > 15:
                verdict, bg, fg, icon = "Undervalued", "#dcfce7", "#065f46", "✅"
            elif diff_pct < -15:
                verdict, bg, fg, icon = "Overvalued", "#fee2e2", "#7f1d1d", "❌"
            else:
                verdict, bg, fg, icon = "Fairly Valued", "#fef9c3", "#713f12", "⚖️"

            v_txt = (
                f"<b>{icon} {verdict}</b> — Fair Value is Rs{dcf_val:,.0f} vs "
                f"Current Price of Rs{current_price:,.0f}, giving "
                f"{abs(diff_pct):.1f}% {'upside' if diff_pct>0 else 'downside'}."
            )
            v_box = Table([[Paragraph(v_txt, STYLES['Normal'])]], colWidths=[6.0*inch])
            v_box.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(bg)),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor(fg)),
                ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor('#e5e7eb')),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            parts += [v_box, Spacer(1, 12)]

        # ---------- Full DCF Projection table ----------
        
        fcf_table = valuation.get('fcf_table') or valuation.get('projection_table')
        if isinstance(fcf_table, list) and fcf_table:
            parts.append(Paragraph("📊 DCF Cash Flow Table", STYLES['Heading3']))

            # 1) real keys for lookups
            keys = list(fcf_table[0].keys())

            # 2) wrapped header cells
            header_style = ParagraphStyle(
                'DCFHeader',
                fontName='Helvetica-Bold',
                fontSize=9,
                leading=9,
                alignment=TA_CENTER,
                wordWrap='CJK',
            )
            headers = [Paragraph(str(k), header_style) for k in keys]

            # helpers
            def _to_num(x):
                if isinstance(x, (int, float)): 
                    return float(x)
                if isinstance(x, str):
                    s = x.replace(',', '').replace('₹', '').strip()
                    try:
                        return float(s)
                    except Exception:
                        return None
                return None

            def _fmt_cell(v):
                n = _to_num(v)
                return f"{n:,.0f}" if n is not None else ("" if v is None else str(v))

            # 3) build rows (use keys, not headers)
            rows = [headers]
            for r in fcf_table:
                rows.append([_fmt_cell(r.get(k, "")) for k in keys])

            # 4) width: fit page + weight by content length
            left_margin = 0.75 * inch
            right_margin = 0.75 * inch
            avail_w = A4[0] - (left_margin + right_margin)

            # estimate weights from header + sample cell lengths
            weights = []
            for ci, k in enumerate(keys):
                h_len = len(str(k))
                # average of first 8 rows (or all if fewer)
                sample = rows[1:9]
                avg_len = sum(len(str(r[ci])) for r in sample) / max(1, len(sample))
                weights.append(max(h_len, avg_len, 4))  # never below 4 for tiny cols

            w_sum = sum(weights)
            # min/max keep things readable but still fill the page
            min_w = 1.3 * inch
            max_w = 2.3 * inch
            col_widths = [max(min_w, min(max_w, (w / w_sum) * avail_w)) for w in weights]
            total_w = sum(col_widths)
            if total_w != avail_w:
                scale = avail_w / total_w
                col_widths = [w * scale for w in col_widths]

            t = LongTable(rows, colWidths=col_widths, repeatRows=1)

            many_cols = len(keys) >= 8
            font_size = 9 if many_cols else 9.5
            pad = 4 if many_cols else 5

            t.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), font_size),
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#111827')),

                # left-align first col (Year), right-align numbers
                ('ALIGN', (0, 1), (0, -1), 'LEFT'),
                ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),

                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), pad),
                ('TOPPADDING', (0, 0), (-1, -1), pad),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ]))

            # safety net for extremely wide tables
            kif = KeepInFrame(avail_w, 9 * inch, content=[t], hAlign='LEFT', mode='shrink')
            parts += [kif, Spacer(1, 20)]
        else:
            parts += [Paragraph("⚠️ No DCF cash flow data available.", STYLES['Normal']), Spacer(1, 12)]

        return parts

    @staticmethod
    def dcf_sens_section(valuation: Dict[str, Any], metrics: Dict[str, Any], assumptions: Dict[str, Any]) -> List:
        """DCF Sensitivity grid only (EBIT% vs Growth%)."""
        if not valuation or not isinstance(valuation, dict):
            return []

        # ---- local helper to avoid NameError if safe_num isn't imported
        def _safe_num(x, default=None):
            try:
                return float(x)
            except Exception:
                return default

        parts: List = [Paragraph("DCF Sensitivity Details", SECTION_STYLE), Spacer(1, 8)]

        sens = valuation
        if isinstance(sens, dict) and sens.get('growth_values') and sens.get('ebit_values') and sens.get('fair_values'):
            parts.append(Paragraph("📈 DCF Sensitivity (EBIT Margin ↓ vs Growth →)", STYLES['Heading3']))

            growth_vals = sens['growth_values']       # columns
            ebit_vals   = sens['ebit_values']         # rows
            matrix      = sens['fair_values']         # rows x cols

            # header row (wrap-able)
            hdr = ["EBIT ↓ / Growth →"] + [f"{float(g):.1f}%" for g in growth_vals]
            rows = [hdr]

            # highlight target from assumptions
            user_ebit   = _safe_num(assumptions.get('ebit_margin'))
            user_growth = _safe_num(assumptions.get('growth_y'))

            # build body
            for i, ebit in enumerate(ebit_vals):
                row = [f"{float(ebit):.2f}%"]
                vals = matrix[i] if i < len(matrix) else []
                for fv in vals:
                    try:
                        cell = f"{float(fv):,.0f}"
                    except Exception:
                        cell = "N/A"
                    row.append(cell)
                rows.append(row)

            # widths that actually fit the page
            from reportlab.platypus import LongTable
            from reportlab.lib.pagesizes import A4
            left_margin  = 0.75 * inch
            right_margin = 0.75 * inch
            avail_w = A4[0] - (left_margin + right_margin)

            cols = len(hdr)
            left_col_w = 1.2 * inch
            other_w = max(0.7 * inch, (avail_w - left_col_w) / (cols - 1))
            col_widths = [left_col_w] + [other_w] * (cols - 1)

            t = LongTable(rows, colWidths=col_widths, repeatRows=1)

            base = TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eef2ff')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('FONTSIZE', (0, 0), (-1, -1), 8.5),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#f8fafc')),
                ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ])

            # color rules vs current price (✅ FIX: define it!)
            cp = _safe_num(metrics.get('current_price'), 0.0) or 0.0

            for i in range(1, len(rows)):  # data rows
                ebit_val = float(ebit_vals[i - 1]) if i - 1 < len(ebit_vals) else None
                for j in range(1, cols):   # skip first label col
                    fv_raw = matrix[i - 1][j - 1] if (i - 1 < len(matrix) and j - 1 < len(matrix[i - 1])) else None
                    if fv_raw is None:
                        continue
                    try:
                        fv = float(fv_raw)
                    except Exception:
                        continue

                    if cp > 0 and abs(fv - cp) / cp < 0.15:
                        base.add('BACKGROUND', (j, i), (j, i), colors.HexColor('#fef3c7'))  # yellow
                        base.add('TEXTCOLOR',  (j, i), (j, i), colors.HexColor('#713f12'))
                        base.add('FONTNAME',   (j, i), (j, i), 'Helvetica-Bold')
                    elif cp > 0 and fv > cp:
                        base.add('BACKGROUND', (j, i), (j, i), colors.HexColor('#dcfce7'))  # green
                        base.add('TEXTCOLOR',  (j, i), (j, i), colors.HexColor('#065f46'))
                    elif cp > 0 and fv < cp:
                        base.add('BACKGROUND', (j, i), (j, i), colors.HexColor('#fee2e2'))  # red
                        base.add('TEXTCOLOR',  (j, i), (j, i), colors.HexColor('#7f1d1d'))

                    # ring the user's selected combo
                    if user_ebit is not None and user_growth is not None:
                        matches_margin = abs(float(ebit_val) - float(user_ebit)) < 1e-6
                        matches_growth = abs(float(growth_vals[j - 1]) - float(user_growth)) < 1e-6
                        if matches_margin and matches_growth:
                            base.add('BOX', (j, i), (j, i), 1.2, colors.HexColor('#3b82f6'))

            t.setStyle(base)
            parts += [t, Spacer(1, 14)]
        else:
            parts += [Paragraph("ℹ️ Sensitivity grid not available in payload.", STYLES['Normal']), Spacer(1, 8)]

        return parts

    # --- Add inside class Sections ---

    @staticmethod
    def eps_section(valuation: Dict[str, Any], metrics: Dict[str, Any], assumptions: Dict[str, Any]) -> List:
        """EPS valuation: verdict + 3Y EPS projection table."""
        if not valuation or not isinstance(valuation, dict):
            return []

        parts: List = [Paragraph("EPS Valuation Details", SECTION_STYLE), Spacer(1, 8)]

        # ---- Verdict box (Fair PE = 20, like web text) ----
        current_price = float(safe_num(metrics.get('current_price'), 0) or 0)
        eps_fv = float(safe_num(valuation.get('eps_fair_value'), 0) or 0)
        if current_price > 0 and eps_fv > 0:
            diff_pct = (eps_fv - current_price) / current_price * 100.0
            if diff_pct > 15:
                verdict, bg, fg, icon = "Undervalued", "#dcfce7", "#065f46", "✅"
            elif diff_pct < -15:
                verdict, bg, fg, icon = "Overvalued", "#fee2e2", "#7f1d1d", "❌"
            else:
                verdict, bg, fg, icon = "Fairly Valued", "#fef9c3", "#713f12", "⚖️"

            msg = (
                f"<b>{icon} {verdict}</b> — EPS Fair Value (PE 20×) is Rs{eps_fv:,.0f} vs "
                f"Current Price Rs{current_price:,.0f} → "
                f"{abs(diff_pct):.1f}% {'upside' if diff_pct > 0 else 'downside'}."
            )
            box = Table([[Paragraph(msg, STYLES['Normal'])]], colWidths=[6.0 * inch])
            box.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(bg)),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor(fg)),
                ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor('#e5e7eb')),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            parts += [box, Spacer(1, 12)]

        # ---- Projection table (like web EPSProjectionTable) ----
        proj = valuation.get('projection_table')
        if not (isinstance(proj, list) and proj):
            parts += [Paragraph("⚠️ EPS projection data not available.", STYLES['Normal']), Spacer(1, 10)]
            return parts

        parts.append(Paragraph("📊 EPS Projection Table", STYLES['Heading3']))

        # columns in web: Year, Revenue, EBIT, Interest, Tax, Net Profit, EPS, PE (Projected)
        keys = list(proj[0].keys())

        header_style = ParagraphStyle(
            'EPSHeader',
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=10,
            alignment=TA_CENTER,
            wordWrap='CJK',
        )
        headers = [Paragraph(str(k), header_style) for k in keys]

        def _num(x):
            if isinstance(x, (int, float)): return float(x)
            if isinstance(x, str):
                s = x.replace(',', '').replace('₹', '').strip()
                try: return float(s)
                except: return None
            return None

        def _fmt(k, v):
            n = _num(v)
            if n is None:
                return "" if v is None else str(v)
            lk = str(k).lower()
            if 'eps' in lk:   return f"{n:,.2f}"
            if 'pe' in lk:    return f"{n:.1f}"
            return f"{n:,.0f}"

        rows = [headers] + [[_fmt(k, r.get(k, "")) for k in keys] for r in proj]

        # Fit to page width (A4 – margins) and weight by content length
        left_margin = 0.75 * inch
        right_margin = 0.75 * inch
        avail_w = A4[0] - (left_margin + right_margin)

        weights = []
        for ci, k in enumerate(keys):
            h_len = len(str(k))
            sample = rows[1:9]
            avg_len = sum(len(str(r[ci])) for r in sample) / max(1, len(sample))
            weights.append(max(h_len, avg_len, 4))
        w_sum = sum(weights)
        min_w, max_w = 1.0 * inch, 2.2 * inch
        col_w = [max(min_w, min(max_w, (w / w_sum) * avail_w)) for w in weights]
        scale = avail_w / sum(col_w)
        col_w = [w * scale for w in col_w]

        t = LongTable(rows, colWidths=col_w, repeatRows=1)
        t.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#111827')),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),   # Year
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ]))

        parts += [KeepInFrame(avail_w, 9 * inch, content=[t], hAlign='LEFT', mode='shrink'), Spacer(1, 16)]
        return parts


    @staticmethod
    def eps_sens_section(valuation: Dict[str, Any], metrics: Dict[str, Any], assumptions: Dict[str, Any]) -> List:
        """EPS sensitivities: (A) EPS vs Growth/EBIT, (B) Target Price vs EPS/PE."""
        if not valuation or not isinstance(valuation, dict):
            return []

        parts: List = []

        # -------- Table A: EPS (EBIT% ↓ vs Growth% →) --------
        s_eps = valuation.get('sensitivity_eps') or {}
        if s_eps.get('growth_options') and s_eps.get('margin_options') and s_eps.get('matrix'):
            parts.append(Paragraph("🎯 Sensitivity A: EPS (EBIT Margin ↓ vs Growth →)", STYLES['Heading3']))
            hdr = ["EBIT ↓ / Growth →"] + [f"{float(g):.1f}%" for g in s_eps['growth_options']]
            rows = [hdr]
            for i, m in enumerate(s_eps['margin_options']):
                row = [f"{float(m):.1f}%"]
                for v in s_eps['matrix'][i]:
                    try:
                        row.append(f"{float(v):,.2f}")
                    except:
                        row.append("N/A")
                rows.append(row)

            left_margin = 0.75 * inch
            right_margin = 0.75 * inch
            avail_w = A4[0] - (left_margin + right_margin)
            left_col = 1.3 * inch
            other_w = max(0.8 * inch, (avail_w - left_col) / (len(hdr) - 1))
            tA = LongTable(rows, colWidths=[left_col] + [other_w] * (len(hdr) - 1), repeatRows=1)
            tA.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eef2ff')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('FONTSIZE', (0, 0), (-1, -1), 8.5),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#f8fafc')),
                ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ]))
            parts += [tA, Spacer(1, 12)]

        # -------- Table B: Target Price (EPS ↓ vs PE →) --------
        s_price = valuation.get('sensitivity_price') or {}
        if s_price.get('pe_options') and s_price.get('eps_options') and s_price.get('matrix'):
            parts.append(Paragraph("💰 Sensitivity B: Target Price (EPS ↓ vs PE →)", STYLES['Heading3']))

            hdr = ["EPS ↓ / PE →"] + [f"{float(pe):.1f}x" for pe in s_price['pe_options']]
            rows = [hdr]
            for i, eps in enumerate(s_price['eps_options']):
                row = [f"{float(eps):,.2f}"]
                for val in s_price['matrix'][i]:
                    try:
                        row.append(f"{float(val):,.0f}")
                    except:
                        row.append("N/A")
                rows.append(row)

            left_margin = 0.75 * inch
            right_margin = 0.75 * inch
            avail_w = A4[0] - (left_margin + right_margin)
            left_col = 1.6 * inch
            other_w = max(0.8 * inch, (avail_w - left_col) / (len(hdr) - 1))
            tB = LongTable(rows, colWidths=[left_col] + [other_w] * (len(hdr) - 1), repeatRows=1)

            # color vs current price; bold the 20x PE column if present
            cp = float(safe_num(metrics.get('current_price'), 0) or 0)
            base = TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eef2ff')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('FONTSIZE', (0, 0), (-1, -1), 8.5),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#f8fafc')),
                ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ])

            # shade cells above/below current price; emphasis on 20x column
            pe_opts = s_price['pe_options']
            try:
                fair_idx = pe_opts.index(20) + 1  # +1 for header label col
            except ValueError:
                fair_idx = None

            for i in range(1, len(rows)):
                for j in range(1, len(hdr)):
                    raw = s_price['matrix'][i - 1][j - 1]
                    try:
                        fv = float(raw)
                    except:
                        continue
                    if cp > 0 and abs(fv - cp) / cp < 0.15:
                        base.add('BACKGROUND', (j, i), (j, i), colors.HexColor('#fef3c7'))
                        base.add('TEXTCOLOR',  (j, i), (j, i), colors.HexColor('#713f12'))
                        base.add('FONTNAME',   (j, i), (j, i), 'Helvetica-Bold')
                    elif cp > 0 and fv > cp:
                        base.add('BACKGROUND', (j, i), (j, i), colors.HexColor('#dcfce7'))
                        base.add('TEXTCOLOR',  (j, i), (j, i), colors.HexColor('#065f46'))
                    elif cp > 0 and fv < cp:
                        base.add('BACKGROUND', (j, i), (j, i), colors.HexColor('#fee2e2'))
                        base.add('TEXTCOLOR',  (j, i), (j, i), colors.HexColor('#7f1d1d'))

            if fair_idx is not None:
                base.add('BOX', (fair_idx, 0), (fair_idx, -1), 1.2, colors.HexColor('#3b82f6'))
                base.add('FONTNAME', (fair_idx, 0), (fair_idx, 0), 'Helvetica-Bold')

            tB.setStyle(base)
            parts += [tB, Spacer(1, 12)]

        if not parts:
            return [Paragraph("ℹ️ EPS sensitivities not available in payload.", STYLES['Normal']), Spacer(1, 8)]
        return parts



    @staticmethod
    def enhanced_disclaimer(data: Dict[str, Any]) -> List:
        """Enhanced disclaimer with SEBI compliance focus"""
        parts: List = []
        
        parts.extend([
            Paragraph("Important Disclaimers & Compliance Notice", SECTION_STYLE),
            Spacer(1, 16)
        ])

        # SEBI Compliance Notice - using SUMMARY_STYLE which exists
        sebi_compliance_text = """
        <b>SEBI Compliance Notice:</b><br/>
        FundalQ is not a SEBI registered investment advisor. This analysis is purely for educational and informational purposes and should not be construed as investment advice, recommendations, or solicitation to buy or sell securities.<br/><br/>
        
        <b>Nature of Analysis:</b><br/>
        All valuation assessments (undervalued/overvalued/fairly valued) are based solely on the mathematical models and assumptions provided. These are analytical findings, not investment recommendations.<br/><br/>
        
        <b>No Investment Advice:</b><br/>
        • This report does not constitute investment advice or recommendations<br/>
        • We do not recommend any specific investment action (buy/hold/sell)<br/>
        • All investment decisions should be made independently or with qualified advisors<br/>
        • Past performance and model projections do not guarantee future results<br/><br/>
        """

        # Important disclaimers with enhanced formatting
        disclaimer_text = """
        <b>Key Risk Factors & Limitations:</b><br/>
        • <b>Model Dependency:</b> All findings depend entirely on input assumptions and methodologies used<br/>
        • <b>Market Risk:</b> Actual market performance may differ significantly from model predictions<br/>
        • <b>Assumption Risk:</b> Changes in growth, margin, or discount rate assumptions will impact results<br/>
        • <b>Execution Risk:</b> Company performance may not match projected financial metrics<br/>
        • <b>Regulatory Risk:</b> Changes in regulations, taxes, or policies may affect valuations<br/>
        • <b>Liquidity Risk:</b> Market conditions may affect the ability to trade at fair value<br/><br/>
        
        <b>User Responsibilities:</b><br/>
        • Conduct independent research and due diligence<br/>
        • Consult with qualified financial advisors before making investment decisions<br/>
        • Consider your risk tolerance, investment objectives, and financial situation<br/>
        • Verify all data and assumptions independently<br/>
        • Stay updated on company and market developments<br/><br/>
        
        <b>Data & Methodology:</b><br/>
        • Analysis based on publicly available financial information<br/>
        • Models use standard financial valuation methodologies (DCF, EPS multiples)<br/>
        • Historical data may not predict future performance<br/>
        • Model outputs are estimates subject to significant uncertainty
        """

        # Use SUMMARY_STYLE for the SEBI notice (exists in your styles)
        parts.extend([
            Paragraph(sebi_compliance_text, SUMMARY_STYLE),
            Spacer(1, 16),
            Paragraph(disclaimer_text, STYLES['Normal']),
            Spacer(1, 20)
        ])

        # FundalQ branding footer - use basic style
        branding_text = """
        <b>About FundalQ:</b><br/>
        <i>Understand the Why, Before the Buy</i><br/>
        Educational financial analysis and valuation platform for informed decision-making.
        """

        # Create simple center-aligned style
        try:
            from reportlab.lib.enums import TA_CENTER
            branding_style = ParagraphStyle(
                'BrandingFooter',
                parent=STYLES['Normal'],
                fontSize=8,
                alignment=TA_CENTER,
                textColor=colors.HexColor('#64748b'),  # Medium gray
                spaceBefore=20
            )
        except:
            # Fallback to basic style if imports fail
            branding_style = STYLES['Normal']

        parts.extend([
            Spacer(1, 20),
            Paragraph(branding_text, branding_style)
        ])

        return parts

    @staticmethod
    def branded_header_footer(canv, doc):
        """Enhanced header and footer with FundalQ branding"""
        canv.saveState()
        
        # FundalQ Brand Colors
        NAVY_PRIMARY = '#1a2332'
        BLUE_ACCENT = '#1e90ff'
        MEDIUM_GRAY = '#64748b'
        
        # Header with FundalQ branding
        canv.setFillColor(colors.HexColor(NAVY_PRIMARY))
        canv.setFont('Helvetica-Bold', 11)
        canv.drawString(40, A4[1] - 30, "FundalQ Financial Analysis Report")
        
        # Tagline in header
        canv.setFillColor(colors.HexColor(MEDIUM_GRAY))
        canv.setFont('Helvetica', 8)
        canv.drawString(40, A4[1] - 45, "Understand the Why, Before the Buy")
        
        # Date in header
        canv.setFont('Helvetica', 10)
        canv.drawRightString(A4[0] - 40, A4[1] - 30, f"Generated: {datetime.now():%Y-%m-%d}")
        
        # Header accent line
        canv.setStrokeColor(colors.HexColor(BLUE_ACCENT))
        canv.setLineWidth(2)
        canv.line(40, A4[1] - 55, A4[0] - 40, A4[1] - 55)
        
        # Footer
        canv.setFillColor(colors.HexColor(MEDIUM_GRAY))
        canv.setFont('Helvetica', 8)
        canv.drawString(40, 30, "Confidential - For Internal Use Only")
        canv.drawRightString(A4[0] - 40, 30, f"Page {doc.page}")
        
        # Footer accent line
        canv.setStrokeColor(colors.HexColor(BLUE_ACCENT))
        canv.setLineWidth(1)
        canv.line(40, 45, A4[0] - 40, 45)
        
        canv.restoreState()