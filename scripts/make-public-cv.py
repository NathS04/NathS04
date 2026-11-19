"""Generate the public, employer-neutral CV. No private source attachments are needed."""
from pathlib import Path
from html import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('output')
args = parser.parse_args()
output = Path(args.output).resolve()
output.parent.mkdir(parents=True, exist_ok=True)
fonts = Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('CV', str(fonts/'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('CV-Bold', str(fonts/'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('CV',normal='CV',bold='CV-Bold')
ink=HexColor('#17243b'); muted=HexColor('#526077'); accent=HexColor('#244b7c')
styles={
 'name':ParagraphStyle('Name',fontName='CV-Bold',fontSize=24,leading=28,textColor=ink,spaceAfter=4),
 'role':ParagraphStyle('Role',fontName='CV-Bold',fontSize=10.2,leading=14,textColor=accent,spaceAfter=5),
 'contact':ParagraphStyle('Contact',fontName='CV',fontSize=8.7,leading=12,textColor=muted,spaceAfter=2),
 'body':ParagraphStyle('Body',fontName='CV',fontSize=9.35,leading=12.4,textColor=ink,spaceAfter=2),
 'section':ParagraphStyle('Section',fontName='CV-Bold',fontSize=9.5,leading=13,textColor=ink,spaceBefore=6,spaceAfter=4),
 'project':ParagraphStyle('Project',fontName='CV-Bold',fontSize=9.6,leading=13,textColor=ink,spaceBefore=5,spaceAfter=2),
 'detail':ParagraphStyle('Detail',fontName='CV',fontSize=8.2,leading=11,textColor=muted,spaceAfter=3),
 'bullet':ParagraphStyle('Bullet',fontName='CV',fontSize=9.25,leading=12.3,leftIndent=9,firstLineIndent=-9,textColor=ink,spaceAfter=2)
}
story=[]
def para(text,style='body'):return Paragraph(text,styles[style])
def add(text,style='body'):story.append(para(text,style))
def section(title):
 story.append(para(title,'section'))
 story.append(HRFlowable(width='100%',thickness=.45,color=HexColor('#aeb9c8'),spaceAfter=4))
def bullet(text):return para('- '+text,'bullet')
def link(url,label):return '<link href="'+escape(url,quote=True)+'" color="#244b7c">'+escape(label)+'</link>'

add('Nathaniel Sebastian','name')
add('Graduate Software &amp; Applied AI Engineer | Python, APIs &amp; Client Delivery','role')
add('Cardiff, UK | Open to London relocation and client travel','contact')
add(link('mailto:nathannn.s04@gmail.com','nathannn.s04@gmail.com')+' | '+link('https://github.com/NathS04','github.com/NathS04')+' | '+link('https://www.linkedin.com/in/nathaniel-sebastian-11a877301/','LinkedIn')+' | '+link('https://nathaniel-sebastian-portfolio.nathannn-s04.chatgpt.site/','Future / Portfolio'),'contact')
add('UK citizen - unrestricted right to work; no sponsorship required | Available immediately','contact')
section('PROFILE')
add('Computer Science with Artificial Intelligence graduate (2:1, University of Leeds) combining Python development, applied AI and paid client delivery. Built an evaluated document-QA system, a tested backend API and traceable data pipelines. Comfortable clarifying requirements, investigating failures and explaining technical choices to non-technical users.')
section('TECHNICAL SKILLS')
add('<b>Programming &amp; web:</b> Python, SQL, JavaScript, HTML/CSS; C++ (academic), Java fundamentals')
add('<b>APIs &amp; data:</b> FastAPI, REST, PostgreSQL, SQLite, SQLAlchemy, pandas, ingestion, JWT/RBAC')
add('<b>Applied AI:</b> RAG, BM25/dense retrieval, reranking, citations, evaluation, Streamlit')
add('<b>Engineering &amp; delivery:</b> pytest, Git, GitHub Actions, Ruff, mypy, Bandit, debugging, requirements discovery, demonstrations and technical documentation')
section('SELECTED PROJECTS')
projects=[
 ('Policy Copilot - Evidence-Grounded AI','Academic dissertation | Python, RAG, retrieval, verification, Streamlit','https://github.com/NathS04/policy_copilot_submission',[
  'Built policy-document question answering with retrieval/reranking, paragraph citations, claim checks and confidence-gated abstention when evidence was insufficient.',
  'Designed a 63-question synthetic benchmark and a 292-test core suite; a documented offline run recorded 290 passes and two conditional skips. Used audit traces to analyse grounding versus answer coverage.'
 ]),
 ('EventHub - API & Data Integration','Academic project | Python, FastAPI, PostgreSQL, SQLAlchemy, REST','https://github.com/NathS04/comp3011-cw1-api',[
  'Built and deployed a 24-endpoint event/RSVP API with JWT authentication, owner/admin controls, Leeds City Council imports and source-provenance tracking.',
  'Created 84 automated tests with approximately 95% coverage; added GitHub Actions CI, linting, static typing and security checks.'
 ]),
 ('Ledger Data Quality & Reconciliation','Personal project | Python, pandas, SQL, SQLite | Synthetic data','https://github.com/NathS04/ledger-data-quality',[
  'Standardised 10,150 synthetic transactions into SQLite; checked completeness, duplicate candidates and vendor references, and reconciled against independent control totals using a £0.01 tolerance.',
  'Produced traceable exception reports, KPI outputs and concise findings to support investigation and downstream reporting.'
 ])
]
for title,detail,url,bullets in projects:
 block=[para(escape(title)+' | '+link(url,'Code'),'project'),para(escape(detail),'detail')]
 block.extend(bullet(escape(text)) for text in bullets)
 story.append(KeepTogether(block))
add('<b>Additional academic work:</b> '+link('https://github.com/NathS04/comp3011-cw2-api','Python search engine')+' with crawling, positional indexing, TF-IDF, phrase search and spelling suggestions; C++/OpenGL graphics with camera, lighting, geometry and animation.')
section('COMMERCIAL EXPERIENCE')
story.append(KeepTogether([
 para('Freelance Web Developer - Delikatesy Miś | Apr-May 2023','project'),
 bullet('Won a paid retailer website project through direct outreach, gathered requirements and delivered an HTML/CSS/JavaScript site over roughly six weeks.'),
 bullet('Led three review demonstrations, translated non-technical feedback into changes and completed the engagement with client acceptance and payment.')
]))
section('EDUCATION')
add('<b>University of Leeds - BSc Computer Science with Artificial Intelligence</b> | 2023-2026')
add('<b>2:1 Honours.</b> Relevant study: Machine Learning, Data Mining, Databases, Software Engineering, Secure Computing and Web Services.')
add('<b>Stanwell School:</b> Mathematics A, Computer Science A, Further Mathematics B; Welsh Baccalaureate A*.')

doc=SimpleDocTemplate(str(output),pagesize=A4,rightMargin=39,leftMargin=39,topMargin=32,bottomMargin=30,title='Nathaniel Sebastian - General CV',author='Nathaniel Sebastian',subject='Software, applied AI, data and client delivery')
doc.build(story)
print(output)
