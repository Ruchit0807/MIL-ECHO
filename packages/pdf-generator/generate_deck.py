import json
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

def generate_pdf_deck():
    base_dir = os.path.dirname(__file__)
    cards_json_path = os.path.join(base_dir, "cards_database.json")
    output_dir = os.path.join(base_dir, "output")
    os.makedirs(output_dir, exist_ok=True)
    output_pdf_path = os.path.join(output_dir, "viral_spiral_offline_deck.pdf")

    # Read card dataset
    with open(cards_json_path, "r", encoding="utf-8") as f:
        cards = json.load(f)

    # Setup Document
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        rightMargin=18,
        leftMargin=18,
        topMargin=18,
        bottomMargin=18
    )

    styles = getSampleStyleSheet()

    # Custom Card Styles
    style_category = ParagraphStyle(
        'CardCategory',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#9d4edd')
    )

    style_headline = ParagraphStyle(
        'CardHeadline',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#000000')
    )

    style_prompt = ParagraphStyle(
        'CardPrompt',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#1e293b')
    )

    style_impact = ParagraphStyle(
        'CardImpact',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#059669')
    )

    def render_card_cell(card):
        if not card:
            return Paragraph("", styles['Normal'])

        content = [
            Paragraph(f"<b>MIL ECHO DECK</b> • {card.get('category', 'Scenario')}", style_category),
            Spacer(1, 4),
            Paragraph(f"<b>\"{card.get('fake_headline', card.get('headline'))}\"</b>", style_headline),
            Spacer(1, 6),
            Paragraph(f"<b>Socratic Prompt:</b> {card.get('socratic_prompt', 'What 1 primary source verifies this?')}", style_prompt),
            Spacer(1, 6),
            Paragraph(f"Resilience: +{card.get('resilience_impact', 15)} | Clout Risk: {card.get('clout_risk', 'High')}", style_impact)
        ]
        return content

    # Layout into 3x3 grid (9 cards per page)
    card_cells = [render_card_cell(c) for c in cards]

    # Fill up to multiples of 9 if necessary
    while len(card_cells) % 9 != 0:
        card_cells.append(render_card_cell(None))

    story = []
    # Build 3x3 table pages
    for page_idx in range(0, len(card_cells), 9):
        page_cards = card_cells[page_idx:page_idx+9]
        grid_data = [
            [page_cards[0], page_cards[1], page_cards[2]],
            [page_cards[3], page_cards[4], page_cards[5]],
            [page_cards[6], page_cards[7], page_cards[8]]
        ]

        table = Table(grid_data, colWidths=[185, 185, 185], rowHeights=[240, 240, 240])
        table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
            ('BOX', (0,0), (-1,-1), 2, colors.HexColor('#00f2fe')),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))

        story.append(table)

    doc.build(story)
    print(f"Successfully generated offline classroom deck PDF at: {output_pdf_path}")

if __name__ == "__main__":
    generate_pdf_deck()
