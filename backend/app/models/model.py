from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, func, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class ModelTask(enum.Enum):
    tabular_classification = "tabular_classification"
    tabular_regression = "tabular_regression"
    timeseries_forecasting = "timeseries_forecasting"


class Model(Base):
    __tablename__ = "models"
    __allow_unmapped__ = True
    __mapper_args__ = {
        "polymorphic_on": "task",
        "polymorphic_identity": None
    }

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    task = Column(Enum(ModelTask), nullable=False)
    size = Column(Integer, nullable=False, default=0)
    uri = Column(String, nullable=True)
    derived_from_id = Column(Integer, ForeignKey('models.id'), nullable=True)

    original_model = relationship(
            'Model',
            remote_side=[id], # The id column of *this* table is the "remote" side
            backref='derived_models' # Creates a 'derived_models' attribute on the parent
        )
    training_job = relationship("TrainingJob", back_populates="model", uselist=False)


# def find_all_ancestors(session: Session, start_model_id: int):
#     # 1. Define the RECURSIVE CTE
#     cte = select(
#         Model.id,
#         Model.name,
#         Model.derived_from_id
#     ).where(
#         # The Anchor Member: Start with the specific model ID
#         Model.id == start_model_id
#     ).cte(
#         "ancestor_cte",
#         recursive=True # CRUCIAL: Marks this CTE as recursive
#     )

#     # 2. Define the Recursive Member
#     # It joins the CTE back to the Model table to find the next ancestor up the chain
#     recursive_member = select(
#         Model.id,
#         Model.name,
#         Model.derived_from_id
#     ).where(
#         # The join condition: the current model's ID matches the previous iteration's derived_from_id
#         Model.id == cte.c.derived_from_id
#     )

#     # 3. Combine Anchor and Recursive Members
#     # union_all joins the initial start model with all subsequent ancestors found recursively
#     recursive_cte = union_all(cte, recursive_member)

#     # 4. Final Query
#     # Select the entire result set from the CTE
#     final_query = select(recursive_cte).select_from(recursive_cte)

#     # Note: If you want to exclude the starting model itself, you would adjust the final query.
    
#     return session.execute(final_query).all()