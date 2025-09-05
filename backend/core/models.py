from __future__ import annotations

import uuid
from datetime import datetime
from sqlalchemy import String, TIMESTAMP, func, ForeignKey, Column, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base
from decimal import Decimal
from sqlalchemy import Numeric, Date
from sqlalchemy import PrimaryKeyConstraint, Date, Numeric
from sqlalchemy import Text, LargeBinary
import json



class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    # Email verification fields
    is_verified = Column(Boolean, nullable=False, default=False)
    name = Column(String(120))
    timezone = Column(String(64))
    avatar_url = Column(String(512))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships - fixed to avoid duplicate definitions
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    verifications: Mapped[list["EmailVerification"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # Changed to String for UUID storage
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  # Changed to match User.id type
    token_hash: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="refresh_tokens")


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)  # Changed to match User.id type
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    base_currency: Mapped[str] = mapped_column(String(6), nullable=False, default="INR")
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    owner: Mapped["User"] = relationship()
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    trade_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    symbol: Mapped[str] = mapped_column(String(32), nullable=False)          # e.g., TCS.NS
    exchange: Mapped[str | None] = mapped_column(String(16))
    side: Mapped[str] = mapped_column(String(8), nullable=False)             # BUY/SELL/DIV/SPLIT/BONUS/FEE
    quantity: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    price: Mapped[Decimal | None] = mapped_column(Numeric(20, 6))            # null for DIV/BONUS/FEE
    fees: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False, default=0)
    trade_ccy: Mapped[str] = mapped_column(String(6), nullable=False, default="INR")
    fx_rate: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))          # 1 trade_ccy = fx_rate INR
    notes: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="transactions")


class FXRate(Base):
    __tablename__ = "fx_rates"

    base: Mapped[str] = mapped_column(String(6), nullable=False)   # e.g., USD
    quote: Mapped[str] = mapped_column(String(6), nullable=False)  # e.g., INR
    as_of: Mapped[datetime] = mapped_column(Date, nullable=False)  # date (no time)
    rate: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)  # 1 base = rate quote

    __table_args__ = (
        PrimaryKeyConstraint("base", "quote", "as_of", name="fx_rates_pk"),
    )


class EmailVerification(Base):
    __tablename__ = "email_verifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(128), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="verifications")


# Add to core/models.py


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Report metadata
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    ticker_symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    report_title: Mapped[str] = mapped_column(String(300), nullable=False)
    
    # Report data (lightweight JSON storage)
    report_data: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string
    
    # PDF metadata
    pdf_file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    pdf_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship()

    def to_dict(self):
        return {
            "id": str(self.id),
            "company_name": self.company_name,
            "ticker_symbol": self.ticker_symbol,
            "report_title": self.report_title,
            "pdf_file_name": self.pdf_file_name,
            "pdf_size_bytes": self.pdf_size_bytes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "report_data": json.loads(self.report_data) if self.report_data else {}
        }