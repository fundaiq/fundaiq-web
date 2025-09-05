from __future__ import annotations
from reportlab.platypus import Flowable
from reportlab.lib import colors

def _format_val(v: float, is_percent: bool = False, decimals: int = 0, comma: bool = False) -> str:
    try:
        if is_percent:
            return f"{v:.1f}%"
        if decimals == 2:
            return f"{v:.2f}"
        if comma:
            return f"{v:,.0f}"
        return f"{v:.0f}"
    except Exception:
        return "0"

def _fmt_rs(val: float) -> str:
    try:
        return f"Rs{float(val):,.0f}"
    except Exception:
        return "Rs0"

class ValuationBarsDrawing(Flowable):
    """Custom flowable to create valuation bars like the webapp"""
    
    def __init__(self, current_price: float, dcf_value: float, eps_value: float, width: int = 500, height: int = 200):
        self.current_price = current_price
        self.dcf_value = dcf_value
        self.eps_value = eps_value
        self.width = width
        self.height = height
        
    def draw(self):
        c = self.canv

        max_val = max(self.current_price, self.dcf_value, self.eps_value, 1) * 1.1
        bar_width, bar_spacing = 70, 150
        start_x, start_y = 80, 60
        max_bar_height = self.height - 100

        # Title
        c.setFont("Helvetica-Bold", 14)
        title = "Investment Opportunity Analysis"
        c.drawString((self.width - len(title) * 7) // 2, self.height - 20, title)

        bars = [
            ("Market\nPrice", self.current_price, colors.HexColor("#64748b")),
            ("DCF Fair\nValue", self.dcf_value, colors.HexColor("#10b981")),
            ("EPS Fair\nValue", self.eps_value, colors.HexColor("#8b5cf6")),
        ]

        for i, (caption, val, col) in enumerate(bars):
            x = start_x + i * bar_spacing
            bar_h = (val / max_val) * max_bar_height if max_val else 0

            # Draw bar
            c.setFillColor(col)
            c.rect(x, start_y, bar_width, bar_h, fill=1, stroke=0)

            # --- Value on top of bar (inside or slightly above)
            c.setFont("Helvetica-Bold", 9)
            value_text = f"Rs{val:,.0f}"
            text_w = c.stringWidth(value_text, "Helvetica-Bold", 9)
            text_x = x + (bar_width - text_w) / 2
            text_y = start_y + bar_h + 5
            c.setFillColor(colors.black if bar_h < 20 else colors.white)  # contrast
            c.drawString(text_x, text_y, value_text)

            # --- Caption lines under bar
            c.setFillColor(colors.black)
            c.setFont("Helvetica", 8)
            lines = caption.split("\n")
            for j, line in enumerate(lines):
                lw = c.stringWidth(line, "Helvetica", 8)
                c.drawString(x + (bar_width - lw) / 2, start_y - 28 - j*12, line)

            # --- Duplicate value label directly below the captions
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(colors.black)
            v_w = c.stringWidth(value_text, "Helvetica-Bold", 9)
            c.drawString(x + (bar_width - v_w) / 2, start_y - 28 - (len(lines) * 12) - 12, value_text)

# --- Simple chart flowables for PDF (bar + line) ---
from typing import List, Optional, Tuple
from reportlab.platypus import Flowable
from reportlab.lib import colors

class _ChartBase(Flowable):
    def __init__(
        self,
        title: str,
        labels: List[str],
        data: List[float],
        width: int = 520,
        height: int = 140,
        y_is_percent: bool = False,
        y_ticks: int = 4,
        padding: Tuple[int, int, int, int] = (16, 32, 16, 28),
    ):
        self.title = title
        self.labels = labels
        self.data = data
        self.width = width
        self.height = height
        self.y_is_percent = y_is_percent
        self.y_ticks = y_ticks
        self.pad_l, self.pad_t, self.pad_r, self.pad_b = padding

    def _bounds(self):
        x0 = self.pad_l
        y0 = self.pad_b
        x1 = self.width - self.pad_r
        y1 = self.height - self.pad_t
        return x0, y0, x1, y1

    def _auto_scale(self) -> Tuple[float, float]:
        if not self.data:
            return 0.0, 1.0
        mn = min(self.data)
        mx = max(self.data)
        if mn == mx:
            if mn == 0:
                return 0.0, 1.0
            pad = abs(mx) * 0.1
            return mn - pad, mx + pad
        span = mx - mn
        return mn - 0.05 * span, mx + 0.05 * span

    def _draw_axes(self, c):
        x0, y0, x1, y1 = self._bounds()
        # Draw frame
        c.setStrokeColor(colors.HexColor("#e5e7eb"))
        c.setLineWidth(0.5)
        c.rect(x0, y0, x1 - x0, y1 - y0, stroke=1, fill=0)

        # Title a bit higher
        if self.title:
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(colors.HexColor("#111827"))
            c.drawString(x0, y1 + 15, self.title)  # +10 instead of +6


    def _draw_y_ticks(self, c, mn, mx, fmt_decimals: int = 0, fmt_comma: bool = False):
        x0, y0, x1, y1 = self._bounds()
        c.setFont("Helvetica", 7)
        c.setFillColor(colors.HexColor("#6b7280"))
        for i in range(self.y_ticks + 1):
            t = i / self.y_ticks
            y = y0 + t * (y1 - y0)
            val = mn + t * (mx - mn)
            label = _format_val(val, is_percent=self.y_is_percent, decimals=fmt_decimals, comma=fmt_comma)
            c.setStrokeColor(colors.HexColor("#f3f4f6"))
            c.setLineWidth(0.5)
            c.line(x0, y, x1, y)  # grid
            c.setFillColor(colors.HexColor("#374151"))
            c.drawRightString(x0 - 4, y - 2, label)

    def _x_positions(self) -> List[float]:
        x0, y0, x1, y1 = self._bounds()
        n = max(1, len(self.data))
        step = (x1 - x0) / n
        return [x0 + step * (i + 0.5) for i in range(n)], step

    def _draw_x_labels(self, c):
        if not self.labels:
            return
        xs, _ = self._x_positions()
        x0, y0, *_ = self._bounds()
        c.setFont("Helvetica", 7)
        c.setFillColor(colors.HexColor("#374151"))
        for i, x in enumerate(xs):
            lab = self.labels[i] if i < len(self.labels) else ""
            # rotate at anchor (x, y0 - 12)
            c.saveState()
            c.translate(x, y0 - 12)
            c.rotate(30)  # tilt 30 degrees
            c.drawString(0, 0, lab)
            c.restoreState()



class BarChartFlowable(_ChartBase):
    def draw(self):
        c = self.canv
        self._draw_axes(c)
        if not self.data:
            return
        mn, mx = self._auto_scale()

        # ⬇️ Treat anything with ₹ or “Cr” as currency → comma formatting
        title_l = (self.title or "").lower()
        is_currency = ("₹" in self.title) or ("cr" in title_l)

        self._draw_y_ticks(c, mn, mx, fmt_decimals=0, fmt_comma=is_currency)

        xs, step = self._x_positions()
        x0, y0, x1, y1 = self._bounds()
        max_h = (y1 - y0)
        bar_w = step * 0.6

        c.setStrokeColor(colors.HexColor("#374151"))
        for i, x in enumerate(xs):
            v = self.data[i]
            t = 0 if mx == mn else (v - mn) / (mx - mn)
            h = max(0, min(1, t)) * max_h
            left = x - bar_w / 2
            c.setFillColor(colors.HexColor("#3b82f6"))
            c.rect(left, y0, bar_w, h, stroke=0, fill=1)

            # label above bar — currency gets commas
            c.setFont("Helvetica-Bold", 7)
            label = _format_val(v, is_percent=self.y_is_percent, decimals=0, comma=is_currency)
            lw = c.stringWidth(label, "Helvetica-Bold", 7)
            c.setFillColor(colors.black)
            c.drawString(x - lw / 2, y0 + h + 4, label)

        self._draw_x_labels(c)


class LineChartFlowable(_ChartBase):
    def draw(self):
        c = self.canv
        self._draw_axes(c)
        if not self.data:
            return
        mn, mx = self._auto_scale()

        title_l = (self.title or "").lower()
        is_ratio_two_dec = ("equity" in title_l) or ("coverage" in title_l) or ("(x)" in title_l)
        is_currency = ("₹" in self.title) or ("cash" in title_l and "bank" in title_l) or ("cr" in title_l)

        # y-axis formatting: 2dp for ratios, commas for currency
        self._draw_y_ticks(c, mn, mx, fmt_decimals=2 if is_ratio_two_dec else 0, fmt_comma=is_currency)

        xs, _ = self._x_positions()
        x0, y0, x1, y1 = self._bounds()
        max_h = (y1 - y0)

        c.setStrokeColor(colors.HexColor("#10b981"))
        c.setLineWidth(1.2)
        last_xy = None
        for i, x in enumerate(xs):
            v = self.data[i]
            t = 0 if mx == mn else (v - mn) / (mx - mn)
            y = y0 + max(0, min(1, t)) * max_h
            if last_xy:
                c.line(last_xy[0], last_xy[1], x, y)
            last_xy = (x, y)

        # points + labels
        c.setFillColor(colors.HexColor("#10b981"))
        c.setFont("Helvetica-Bold", 7)
        for i, x in enumerate(xs):
            v = self.data[i]
            t = 0 if mx == mn else (v - mn) / (mx - mn)
            y = y0 + max(0, min(1, t)) * max_h
            c.circle(x, y, 1.8, stroke=0, fill=1)

            label = _format_val(
                v,
                is_percent=self.y_is_percent,
                decimals=2 if is_ratio_two_dec else 0,
                comma=is_currency
            )
            lw = c.stringWidth(label, "Helvetica-Bold", 7)
            c.setFillColor(colors.black)
            c.drawString(x - lw / 2, y + 6, label)

        self._draw_x_labels(c)