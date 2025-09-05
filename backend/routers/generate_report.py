# Replace your existing complex code with:
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from services.enhanced_pdf_generator import EnhancedPDFGenerator
from typing import Dict, Any
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize the generator once
pdf_generator = EnhancedPDFGenerator()

@router.post("/generate-enhanced-report")
async def generate_enhanced_report(data: Dict[str, Any]):
    """Simple enhanced endpoint"""
    try:
        template_type = data.get('template_type', 'standard')
        pdf_bytes = pdf_generator.generate_pdf(data, template_type)
        
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
        logger.error(f"PDF generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preview-report-sections")
async def preview_sections(data: Dict[str, Any]):
    """Preview endpoint"""
    sections = {}
    if data.get('companyInfo', {}).get('name'): sections['company_info'] = True
    if data.get('executiveSummary'): sections['executive_summary'] = True
    if data.get('valuationResults'): sections['valuation'] = True
    if data.get('assumptions'): sections['assumptions'] = True
    if data.get('metrics'): sections['metrics'] = True
    
    return {"sections": sections, "total_sections": len(sections)}