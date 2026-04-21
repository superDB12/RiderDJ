# David Brown
**Software Engineer**

Aurora, CO | superdavidabrown@gmail.com | linkedin.com/in/davidbrown | (720) 982-6327

---

## PROFESSIONAL SUMMARY

Results-driven full-stack software engineer with deep expertise in Python backend systems, React/TypeScript frontends, AI/ML integration, and financial data engineering. Proven ability to design and ship end-to-end features across the full stack — from RESTful API design and SQLite-backed persistence layers to interactive React dashboards and NLP-powered analytics pipelines. Skilled in Python, TypeScript, React, Flask, SQL, and modern AI tooling, with hands-on experience integrating large language models, transformer-based NLP, and vector similarity search into production systems. Looking to contribute technical skills and innovative thinking to a forward-thinking team.

---

## PROFESSIONAL EXPERIENCE

### Funky Innovations — Arvada, Colorado
**R&D AI Engineer**
February 2025 – Present

**StockPortfolioManager — AI-Powered Investment Analytics Platform**

Served as a key contributor on an open-source stock portfolio management and analysis system, building full-stack features across a Python/Flask backend, React/TypeScript frontend, and AI-integrated analytics layer.

- **Harvest Ladder Dashboard (React/TypeScript/Material UI):** Designed and built a full-featured investment management dashboard using Vite, React, TypeScript, and Material UI. The application provides complete CRUD for harvest plans and rungs, a summary dashboard with aggregate stats, status filtering, plan detail views with rung tables, live stock price polling, and a symbols management page. Vite proxy configuration routes `/api` calls to a Flask backend on port 5000.

- **Flask REST API (14 Endpoints):** Architected and implemented a RESTful API layer (`api/app.py`) exposing 14 endpoints for harvest plans, rung lifecycle management, symbol tracking, and dashboard aggregation. Extended the underlying `HarvesterPlanDB` SQLite persistence layer with 8 new query methods to support the API surface.

- **Interactive Securities Dashboard (React + D3):** Built a multi-view securities dashboard featuring a Technical Screener, Options Analytics, and a Signals tab for identifying bounce bottoms and trade setups. Implemented a Max Pain chart using D3.js, price history visualization, and a detailed options chain view with greeks and volume analysis.

- **FinBERT Sentiment Analysis Integration:** Integrated the FinBERT transformer model (HuggingFace Transformers + PyTorch) into the analytics pipeline for financial news sentiment scoring. Built the news collection pipeline (RSS + yfinance news fetcher), SQLite persistence for articles and scores, and wired FinBERT sentiment interpretations into the Securities Detail view across multiple tabs.

- **MCP Server Tools (FastMCP):** Built three Model Context Protocol (MCP) servers to expose financial analytics to AI agents: a stock price and technical signals server (`stock_price_server.py`), a market microstructure server covering dark pool activity, short interest, and bid/ask spreads (`market_analysis_server.py`), and a news sentiment server (`news_sentiment_server.py`). Tools are auto-registered via `.mcp.json` for seamless Claude AI integration.

- **Options Chain Persistence:** Implemented SQLite-backed storage for end-of-day options chain snapshots (`options_store.py`), enabling historical options data retention, P/C ratio trending, and put-score weighted analysis. Built a cron-compatible collector script for automated EOD data capture.

- **OHLCV Bar Cache:** Designed a SQLite-backed OHLCV cache layer (`ohlcv_cache.py`) to eliminate redundant yfinance API calls across tools, significantly reducing fetch overhead during multi-signal analysis runs.

- **Notifier Enhancements:** Extended the Discord webhook notification system to support options trade alerts, harvest plan rung achievements, and Harvester plan state transitions; implemented deduplication to avoid alert noise.

- **Portfolio Enhancements:** Added earnings date retrieval and display to the portfolio tracker (integrating income statement data via `yf.Tickers()`); implemented graceful degradation so the system runs fully without external secrets (Discord webhooks, S3 upload).

---

**SecurityRAG — Cybersecurity Knowledge Retrieval-Augmented Generation System**

Designed and built a production-grade RAG system for semantic search and AI-generated article synthesis over a large corpus of cybersecurity podcast transcripts ("Security Now!" by GRC/Steve Gibson). The system allows users to query a domain-specific knowledge base and receive LLM-generated answers grounded strictly in the corpus, with an optional path to expand into full articles augmented with public internet data via OpenAI.

- **Domain-Specific Web Crawler and Ingestion Pipeline:** Built a custom crawler using LangChain's `RecursiveUrlLoader` with regex-based anchor link extraction to scrape both current-year and full historical episode archives from grc.com. Implemented regex parsers to extract structured episode metadata (episode number, air date, title, hosts, series) from transcript headers. Ingestion pipeline is fully idempotent — deduplicates against PostgreSQL before inserting, supports incremental updates, and handles partial failures gracefully.

- **Dual-Embedding Vector Architecture:** Engineered a dual-model embedding pipeline storing both **OpenAI `text-embedding-3-large` (3072-dimensional)** and **SBERT `all-MiniLM-L6-v2` (384-dimensional)** vectors per document chunk in a PGVector table. Offset-based split storage avoids content duplication — split boundaries are stored as `(DocID, SplitStartOffset, SplitLength)` and content is reconstructed at query time via a SQL `SUBSTRING` join, eliminating redundant storage.

- **PGVector Cosine Similarity Search:** Implemented configurable semantic retrieval using PGVector's cosine distance operator on PostgreSQL hosted on Google Cloud SQL. Retrieval parameters (`MAX_SPLITS`, `DIST_THRESHOLD`) are externalized to environment variables, enabling tuning without code changes. The system supports switching between OpenAI and SBERT embeddings at query time via a unified search interface.

- **LLM-Based Concept Extraction (Multi-Shot Prompting):** Built a `ConceptExtractor` module using multi-shot prompt engineering with GPT-4o-mini to preprocess natural language queries into core concept phrases before retrieval. The Flask application runs dual-path generation — the raw user query and the concept-extracted reformulation are both retrieved and answered in parallel, providing comparative outputs to the user.

- **RAG Generation Pipeline (LangChain RunnableSequence):** Wired the full retrieval-to-generation pipeline using LangChain's `RunnableSequence` (`PromptTemplate | LLM`), composing dynamically assembled context from top-k retrieved splits with user queries and injecting them into GPT-4o-mini for grounded response generation.

- **LLM-as-Judge Embedding Evaluation Framework:** Designed and implemented a systematic evaluation harness (`sbert_vs_openai_evaluator.py`) to benchmark SBERT vs. OpenAI embedding quality. For each test query the system: (1) runs both models against the corpus, (2) generates HTML reports with side-by-side split comparisons annotated with cosine distances, (3) asks GPT-4o-mini to judge which embedding model returned more relevant fragments, (4) generates summaries from each model's retrieved splits, and (5) has the LLM evaluate summary quality. Win/loss tallies and split-vs-summary mismatch scores are tracked across the full query set. Context window safety truncation (200k char cap) prevents rate-limit failures during automated runs.

- **Flask Web Application with Interaction Logging:** Built the web UI (`app.py`) with a query submission interface and a results view rendering both raw and concept-augmented responses side-by-side. Wired a user feedback loop — response quality scores and free-text comments are captured and persisted to a PostgreSQL `request_and_response_log` table via SQLAlchemy ORM for ongoing quality tracking.

- **Google Cloud Infrastructure:** Deployed on Google Compute Engine; PostgreSQL database on Google Cloud SQL using the Cloud SQL Python Connector (`pg8000`) for secure IAM-based connectivity. All secrets (database credentials, OpenAI API key) are managed via Google Cloud Secret Manager with no credentials in code or environment files.

- **Batch Processing Optimization:** Implemented a batch document analyzer (`batch_analyzer.py`) that collects all unprocessed splits per document and calls `embed_documents` in a single batch call (20 docs/batch) rather than individual per-split API calls, substantially reducing OpenAI API latency and call overhead.

---

### S&P Global — Boulder, Colorado
**Software Engineer**
January 2023 – February 2025

- Successfully developed and maintained complex backend applications in multiple languages.
- Managed multiple AWS cloud-based solutions and database operations to support a variety of production environments.
- Designed and launched RESTful APIs, with a focus on high performance and scalability.

---

### IHS Markit — Boulder, Colorado
**Software Engineer**
October 2019 – January 2023

- Identified and resolved critical bugs in live production environments, resulting in reduced downtime, fewer customer issues, and increased profitability.
- Improved system reliability by designing and implementing code refactors that optimized existing infrastructure and enhanced functionality.

---

### Techtonic — Boulder, Colorado
**Software Developer**
March 2019 – October 2019

- Developed preliminary project mockups for clients, with designs incorporated into final delivered products.
- Built applications using Python, Django, SQL, NoSQL, React, Redux, JavaScript, Bootstrap, HTML, and CSS.
- Utilized Jira and GitHub for collaborative Agile project management.

---

### State of Colorado — Dumont, Colorado
**District Supervisor, Port of Entry**
May 2006 – March 2019

- Directed daily operations across port facilities, managing efficient flow of goods, travelers, and vehicles while maintaining high-security standards.
- Supervised officers and administrative staff, providing coaching, performance evaluations, and professional development.
- Implemented strategic staffing schedules to address peak traffic periods, reducing wait times without compromising security protocols.

---

## SIDE PROJECTS

### RiderDJ — Real-Time Ride Music Queue App
**React Native (Expo) · Fastify · PostgreSQL · WebSockets · Spotify API · Railway**

Built a full-stack mobile app that lets passengers in a vehicle request songs to a shared Spotify queue in real time. The driver hosts a ride session and passengers join via a shareable link — no account required.

- **React Native app (Expo SDK 55):** Built a cross-platform iOS/Android app with a driver dashboard and a passenger queue screen. Implemented real-time queue updates via WebSockets with auto-reconnect, application-level ping/pong heartbeats, and HTTP fallback re-sync on reconnect.
- **Fastify REST + WebSocket backend:** Designed and built a Node.js/TypeScript API with ride lifecycle management (create, join, end, auto-expiry), song queue CRUD, and a WebSocket broadcast layer that pushes queue updates to all connected clients instantly.
- **Spotify integration:** Integrated the Spotify Web API for track search, metadata retrieval, and programmatic queue injection into the driver's active playback session. Implemented automatic token refresh to maintain uninterrupted sessions.
- **No-install web queue page:** Built a mobile-optimized web UI served directly from the backend, allowing passengers to search and add songs from any browser without installing the app. Implemented deferred deep linking — the join link opens the native app if installed, falling back to the web page automatically.
- **Deployed on Railway:** Backend and PostgreSQL database deployed on Railway with Prisma ORM for schema management and migrations.

---

## KEY SKILLS

**Languages:** Python, TypeScript, JavaScript, C#, SQL

**Frontend:** React, Vite, Material UI, D3.js, Redux, HTML, CSS, Bootstrap

**Backend:** Flask, Django, RESTful API design, FastMCP (Model Context Protocol), SQLAlchemy ORM

**AI / ML:** OpenAI API, FinBERT (HuggingFace Transformers), RAG systems, SBERT / Sentence Transformers, LangChain (RunnableSequence, RecursiveUrlLoader, text splitters), PyTorch, multi-shot prompt engineering, LLM-as-judge evaluation

**Vector Search & Embeddings:** PGVector, OpenAI `text-embedding-3-large` (3072-dim), SBERT `all-MiniLM-L6-v2` (384-dim), cosine similarity search, dual-embedding architectures

**Data & Persistence:** PostgreSQL, PGVector, SQLite, AWS (S3, cloud infrastructure), Google Cloud SQL, Google Compute Engine, Google Cloud SQL Python Connector

**Financial Data:** yfinance, options chain analytics, OHLCV data, technical indicators, sentiment analysis

**Tools & Practices:** Git, GitHub, Jira, Agile/Scrum, Docker, Google Secrets Manager

---

## CERTIFICATIONS

- Certificate of Apprenticeship in Software Development — U.S. Department of Labor
