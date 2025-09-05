from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from core.db import Base
from core.models import User

# one source of truth for the FK type (UUID in your case)
USER_ID_SQLTYPE = User.__table__.c.id.type

class PasswordReset(Base):
    __tablename__ = "password_resets"

    token_hash = Column(String(128), primary_key=True, index=True)
    user_id    = Column(USER_ID_SQLTYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at    = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", backref="password_resets")
