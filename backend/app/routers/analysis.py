from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import CodeAnalysis, User
from ..schemas import CodeAnalysisCreate, CodeAnalysisResponse
from ..services.llm import analyze_code
from ..auth import get_current_user

router = APIRouter(prefix="/analysis", tags=["code analysis"])


async def process_analysis(analysis_id: int, code: str, language: str, db_url: str):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        analysis = db.query(CodeAnalysis).filter(CodeAnalysis.id == analysis_id).first()
        if not analysis:
            return
        
        analysis.status = "processing.."
        db.commit()
        
        result = await analyze_code(code, language)
        
        analysis.result = result
        analysis.status = "completed"
        analysis.completed_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        analysis.status = "failed"
        analysis.result = f"Analysis failed: {str(e)}"
        db.commit()
    finally:
        db.close()


@router.post("/", response_model=CodeAnalysisResponse, status_code=status.HTTP_201_CREATED)

async def create_analysis(
    analysis: CodeAnalysisCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_analysis = CodeAnalysis(
        title=analysis.title,
        code_content=analysis.code_content,
        language=analysis.language,
        status="pending",
        owner_id=current_user.id
    )

    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    
    
    from ..database import DATABASE_URL
    background_tasks.add_task(
        process_analysis,
        new_analysis.id,
        analysis.code_content,
        analysis.language,
        DATABASE_URL
    )
    
    return new_analysis


@router.get("/", response_model=List[CodeAnalysisResponse])

def get_analyses(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    analyses = db.query(CodeAnalysis).filter(
        CodeAnalysis.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return analyses


@router.get("/{analysis_id}", response_model=CodeAnalysisResponse)
def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(CodeAnalysis).filter(
        CodeAnalysis.id == analysis_id,
        CodeAnalysis.owner_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found, Please try again"
        )
    return analysis

@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(CodeAnalysis).filter(
        CodeAnalysis.id == analysis_id,
        CodeAnalysis.owner_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    db.delete(analysis)
    db.commit()
    return None

@router.put("/{analysis_id}", response_model=CodeAnalysisResponse)

def update_analysis(
    analysis_id: int,
    updated_data: CodeAnalysisCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(CodeAnalysis).filter(
        CodeAnalysis.id == analysis_id,
        CodeAnalysis.owner_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found, Please try again"
        )
    
    analysis.title = updated_data.title
    analysis.code_content = updated_data.code_content
    analysis.language = updated_data.language
    analysis.status = "pending"
    analysis.result = None
    analysis.completed_at = None
    
    db.commit()
    db.refresh(analysis)
    return analysis