"""
Enhanced PDF generator with Phase 2 Valuation Analysis improvements
This replaces your current generator.py with enhanced valuation visualizations
"""

from io import BytesIO
from typing import Dict, Any, List
from reportlab.platypus import SimpleDocTemplate
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from datetime import datetime
import logging

# Import the sections with enhanced valuation capabilities
from .sections import Sections

logger = logging.getLogger(__name__)

class EnhancedPDFGenerator:
    """
    Enhanced PDF generator with Phase 2: Professional Valuation Analysis
    
    New Features:
    - Enhanced valuation visualizations with professional charts
    - Investment verdict sections with clear recommendations
    - Valuation method breakdowns with risk analysis
    - Compact and detailed valuation templates
    - Professional gauge indicators
    """
    
    def __init__(self):
        self.page_margins = {
            'top': 80,      # Branded header
            'bottom': 60,   # Branded footer  
            'left': 50,     # Professional margins
            'right': 50
        }
    
    def generate_pdf(self, data: Dict[str, Any], template_type: str = "standard") -> bytes:
        """
        Generate enhanced PDF with Phase 2 valuation analysis improvements
        
        Args:
            data: Financial analysis data
            template_type: 'standard' | 'executive' | 'detailed' | 'valuation_focused'
            
        Returns:
            bytes: PDF content with enhanced valuation analysis
        """
        try:
            buffer = BytesIO()
            
            # Create document with enhanced margins for branding
            doc = SimpleDocTemplate(
                buffer, 
                pagesize=A4,
                topMargin=self.page_margins['top'],
                bottomMargin=self.page_margins['bottom'],
                leftMargin=self.page_margins['left'], 
                rightMargin=self.page_margins['right'],
                title=self._get_document_title(data),
                author="FundalQ - Understand the Why, Before the Buy"
            )

            # Build content based on template type
            if template_type == "valuation_focused":
                content = self._build_valuation_focused_template(data)
            elif template_type == "executive":
                content = self._build_executive_template(data)
            elif template_type == "detailed":
                content = self._build_detailed_template(data)
            else:  # standard
                content = self._build_standard_template(data)

            # Build PDF with branded header/footer
            try:
                doc.build(
                    content, 
                    onFirstPage=Sections.branded_header_footer, 
                    onLaterPages=Sections.branded_header_footer
                )
            except AttributeError:
                # Fallback to legacy header/footer
                doc.build(
                    content, 
                    onFirstPage=Sections.header_footer, 
                    onLaterPages=Sections.header_footer
                )
            
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            logger.info(f"Enhanced PDF with Phase 2 valuation generated successfully ({len(pdf_bytes)} bytes)")
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"Enhanced PDF generation failed: {str(e)}")
            raise

    def _get_document_title(self, data: Dict[str, Any]) -> str:
        """Generate document title from company data"""
        company_info = data.get('companyInfo', {})
        company_name = company_info.get('name', 'Financial Analysis')
        ticker = company_info.get('ticker', '')
        
        if ticker:
            return f"{company_name} ({ticker}) - FundalQ Valuation Report"
        return f"{company_name} - FundalQ Valuation Report"

    def _build_standard_template(self, data: Dict[str, Any]) -> List:
        """Build standard template with enhanced valuation analysis"""
        content = []
        
        # Get data sections for legacy methods
        valuation = data.get('valuationResults', {})
        assumptions = data.get('assumptions', {}) or {}
        metrics = data.get('metrics', {}) or {}
        
        # Enhanced title page
        try:
            content.extend(Sections.enhanced_title_page(data))
        except AttributeError:
            content.extend(Sections.title_page(data))
        
        # Enhanced executive summary
        try:
            content.extend(Sections.enhanced_executive_summary(data))
        except AttributeError:
            content.extend(Sections.executive_summary(data))
        
        # **ENHANCED VALUATION ANALYSIS - Phase 2**
        try:
            # Use the new enhanced valuation analysis
            content.extend(Sections.enhanced_valuation_analysis(data))
        except AttributeError:
            # Fallback to enhanced legacy-compatible version
            try:
                content.extend(Sections.enhanced_valuation_legacy_compatible(valuation, metrics))
            except AttributeError:
                # Final fallback to original
                content.extend(Sections.valuation(valuation, metrics))
        
        # Legacy detailed sections that work well
        content.extend(Sections.assumptions_block(assumptions))
        content.extend(Sections.dcf_section(valuation.get('dcf', {}) or valuation, metrics, assumptions))
        content.extend(Sections.dcf_sens_section(valuation.get('dcf_sensitivity', {}) or valuation, metrics, assumptions))
        content.extend(Sections.eps_section(valuation.get('eps', {}) or valuation, metrics, assumptions))
        content.extend(Sections.eps_sens_section(valuation.get('eps', {}) or valuation, metrics, assumptions))
        content.extend(Sections.metrics_grid(metrics, assumptions))
        content.extend(Sections.financial_health(metrics))
        
        # Enhanced disclaimer
        try:
            content.extend(Sections.enhanced_disclaimer(data))
        except AttributeError:
            content.extend(Sections.disclaimer())
        
        return content

    def _build_executive_template(self, data: Dict[str, Any]) -> List:
        """Build executive template focused on key insights"""
        content = []
        
        # Get data for legacy methods
        valuation = data.get('valuationResults', {})
        metrics = data.get('metrics', {}) or {}
        
        # Enhanced title page
        try:
            content.extend(Sections.enhanced_title_page(data))
        except AttributeError:
            content.extend(Sections.title_page(data))
        
        # Enhanced executive summary
        try:
            content.extend(Sections.enhanced_executive_summary(data))
        except AttributeError:
            content.extend(Sections.executive_summary(data))
        
        # **COMPACT VALUATION ANALYSIS - Perfect for executives**
        try:
            content.extend(Sections.enhanced_valuation_compact(data))
        except AttributeError:
            # Fallback to standard enhanced valuation
            try:
                content.extend(Sections.enhanced_valuation_analysis(data))
            except AttributeError:
                content.extend(Sections.valuation(valuation, metrics))
        
        # Financial health summary
        try:
            content.extend(Sections.enhanced_financial_health(data))
        except AttributeError:
            content.extend(Sections.financial_health(metrics))
        
        # Enhanced disclaimer
        try:
            content.extend(Sections.enhanced_disclaimer(data))
        except AttributeError:
            content.extend(Sections.disclaimer())
        
        return content

    def _build_detailed_template(self, data: Dict[str, Any]) -> List:
        """Build detailed template with comprehensive analysis"""
        content = []
        
        # Get data sections
        valuation = data.get('valuationResults', {})
        assumptions = data.get('assumptions', {}) or {}
        metrics = data.get('metrics', {}) or {}
        
        # Enhanced title page
        try:
            content.extend(Sections.enhanced_title_page(data))
        except AttributeError:
            content.extend(Sections.title_page(data))
            
        # Enhanced executive summary
        try:
            content.extend(Sections.enhanced_executive_summary(data))
        except AttributeError:
            content.extend(Sections.executive_summary(data))
            
        # **COMPREHENSIVE VALUATION ANALYSIS - Phase 2**
        try:
            content.extend(Sections.enhanced_valuation_analysis(data))
        except AttributeError:
            content.extend(Sections.valuation(valuation, metrics))
        
        # **VALUATION GAUGES** - Additional visual analysis
        try:
            content.extend(Sections.valuation_gauges_section(data))
        except AttributeError:
            pass  # Skip if not available
        
        # Legacy detailed sections
        content.extend(Sections.assumptions_block(assumptions))
        content.extend(Sections.dcf_section(valuation.get('dcf', {}) or valuation, metrics, assumptions))
        content.extend(Sections.dcf_sens_section(valuation.get('dcf_sensitivity', {}) or valuation, metrics, assumptions))
        content.extend(Sections.eps_section(valuation.get('eps', {}) or valuation, metrics, assumptions))
        content.extend(Sections.eps_sens_section(valuation.get('eps', {}) or valuation, metrics, assumptions))
        content.extend(Sections.metrics_grid(metrics, assumptions))
        
        # Enhanced financial health
        try:
            content.extend(Sections.enhanced_financial_health(data))
        except AttributeError:
            content.extend(Sections.financial_health(metrics))
            
        # Enhanced disclaimer
        try:
            content.extend(Sections.enhanced_disclaimer(data))
        except AttributeError:
            content.extend(Sections.disclaimer())
        
        return content

    def _build_valuation_focused_template(self, data: Dict[str, Any]) -> List:
        """NEW: Build valuation-focused template - highlights analytical findings"""
        content = []
        
        valuation = data.get('valuationResults', {})
        metrics = data.get('metrics', {}) or {}
        assumptions = data.get('assumptions', {}) or {}
        
        # Compact title page
        try:
            content.extend(Sections.enhanced_title_page(data))
        except AttributeError:
            content.extend(Sections.title_page(data))
        
        # **COMPREHENSIVE VALUATION SECTION**
        try:
            content.extend(Sections.enhanced_valuation_analysis(data))
        except AttributeError:
            content.extend(Sections.valuation(valuation, metrics))
        
        # **VALUATION GAUGES**
        try:
            content.extend(Sections.valuation_gauges_section(data))
        except AttributeError:
            pass
        
        # Key DCF and EPS details
        content.extend(Sections.dcf_section(valuation.get('dcf', {}) or valuation, metrics, assumptions))
        content.extend(Sections.eps_section(valuation.get('eps', {}) or valuation, metrics, assumptions))
        
        # Sensitivity analysis
        content.extend(Sections.dcf_sens_section(valuation.get('dcf_sensitivity', {}) or valuation, metrics, assumptions))
        content.extend(Sections.eps_sens_section(valuation.get('eps', {}) or valuation, metrics, assumptions))
        
        # Key assumptions
        content.extend(Sections.assumptions_block(assumptions))
        
        # Enhanced disclaimer
        try:
            content.extend(Sections.enhanced_disclaimer(data))
        except AttributeError:
            content.extend(Sections.disclaimer())
        
        return content

    def validate_data(self, data: Dict[str, Any]) -> bool:
        """Validate input data structure"""
        required_sections = ['companyInfo']
        
        for section in required_sections:
            if section not in data:
                logger.warning(f"Missing required section: {section}")
                return False
        
        company_info = data.get('companyInfo', {})
        if not company_info.get('name'):
            logger.warning("Company name is required")
            return False
            
        return True

    def get_template_options(self) -> Dict[str, str]:
        """Get available template options including new valuation-focused template"""
        return {
            'standard': 'Standard comprehensive report with enhanced valuation analysis',
            'executive': 'Executive summary with compact valuation overview', 
            'detailed': 'Detailed analysis with comprehensive valuation breakdown and gauges',
            'valuation_focused': 'NEW: Valuation-focused report highlighting analytical findings'
        }


# Legacy compatibility
class PDFGenerator(EnhancedPDFGenerator):
    """Legacy compatibility class"""
    pass


# Convenience functions
def generate_fundalq_report(data: Dict[str, Any], template_type: str = 'standard') -> bytes:
    """Generate FundalQ branded report with enhanced valuation analysis"""
    generator = EnhancedPDFGenerator()
    
    if not generator.validate_data(data):
        raise ValueError("Invalid data structure for PDF generation")
    
    return generator.generate_pdf(data, template_type)

def generate_valuation_focused_report(data: Dict[str, Any]) -> bytes:
    """Generate valuation-focused report - NEW template for analytical findings"""
    return generate_fundalq_report(data, 'valuation_focused')