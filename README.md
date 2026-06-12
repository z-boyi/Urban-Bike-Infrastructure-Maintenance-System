# 🚲 Urban Bike Infrastructure Maintenance System

> **Production-grade operational analytics platform** for fleet management.  
> End-to-end data engineering: normalized relational database, complex SQL analytics, KPI metrics, REST API architecture.

---

## ⚡ Quick Impact

| What | Details |
|------|---------|
| **Database** | 15-table 3NF normalized schema with referential integrity |
| **Analytics** | 7 complex SQL queries (joins, aggregations, relational division) |
| **APIs** | 20+ REST endpoints for CRUD & analytics operations |
| **KPIs** | 4 real-time metrics (availability %, MTTR, completion rate, health score) |
| **Tech Stack** | Oracle, Node.js/Express, SQL, REST API |
| **Code** | 945 lines of query logic + 390 lines of API routes |

---

## 👥 Team
- **Boyi Zhang** — Database Design, Analytics Queries, Backend API
- **Runtan Zhang** — Schema Optimization, Query Performance
- **Xinghao Huang** — Data Modeling, Frontend Integration

## 📊 The System: Fleet Operations Analytics

**Real-world problem:** How do you track bikes, maintenance, technicians, and costs across a city-wide network?

**Our solution:** A normalized relational database + analytics layer that computes operational KPIs in real-time.

### Core Features

**Transactional Operations** (OLTP)
- Track 1000+ bikes across multiple stations
- Report and classify issues (condition-based routing)
- Assign maintenance tasks to technicians
- Monitor repair progress and completion

**Analytical Queries** (OLAP)
- Fleet availability % by station → Operations decisions
- Technician MTTR (Mean Time to Repair) → Productivity benchmarking
- Maintenance completion rate by priority → SLA compliance
- Fleet health scoring → Predictive maintenance signals

## 🗄️ Database Architecture: Why It Matters

### Schema Design (15 Tables, 3NF Normalized)

The database is optimized for **both** fast operational writes and complex analytical queries:

```
FLEET MANAGEMENT          OPERATIONS           WORKFORCE            REPORTING
├── Bike                  ├── IssueRecord      ├── Staff             ├── CustomerAccount
├── RegularBike           ├── IssueRule        ├── Technician        ├── CustomerContact
├── EBike                 ├── Maintenance      ├── Inspector          └── Report
├── BikeStation           ├── MaintenanceTask  └── Manager
├── StationInfo           ├── Component
└── StationAddress        └── Need
```

**Why 3NF Matters:**
- ✅ No data duplication → single source of truth
- ✅ Update anomalies prevented → maintain consistency
- ✅ Referential integrity enforced → data quality guaranteed
- ✅ Scales for analytics → complex joins work efficiently

**Key Design Patterns:**
- Polymorphic type hierarchy (Bike → RegularBike/EBike)
- Constraint-based business rules (status validation, date ranges)
- Cascading deletes (maintain referential integrity automatically)
- Foreign keys across 15 tables (prevent orphaned records)

## 📈 7 Analytical SQL Queries

### What You're Actually Querying

| # | Query | SQL Technique | Business Use | Impact |
|---|-------|---------------|--------------|--------|
| 1 | Fleet Availability % | CASE/SUM, GROUP BY | Which stations are under-supplied? | Optimize bike rebalancing |
| 2 | Fleet Health Score | LEFT JOIN, AVG aggregation | Which bikes fail most often? | Predict maintenance needs |
| 3 | Technician MTTR | Date arithmetic, AVG, ranking | Who's most efficient? | Benchmark staff performance |
| 4 | Completion Rate by Priority | Conditional aggregation, ratio | Are we meeting SLAs? | Track operational throughput |
| 5 | Bikes with Issues | GROUP BY, HAVING COUNT | Which bikes to quarantine? | Prevent customer issues |
| 6 | Above-Average Workload | Nested aggregation subquery | Who's overloaded? | Resource planning decisions |
| 7 | Cross-Trained Staff | Relational division (NOT EXISTS + MINUS) | Who can do all tasks? | Capability assessment |

**Why This Matters:**
- Demonstrates SQL progression: beginner → advanced
- Shows ability to translate business problems into queries
- Includes production patterns: null handling, efficient aggregation
- Real metrics that drive decisions (not just data for data's sake)

---

## 🔌 REST API: Data Exposure Layer

### 20+ Endpoints Across 3 Categories

**Operations (CRUD)**
```
/bike/fetch, /bike/search, /bike/insert, /bike/update-status, /bike/delete
/issue/fetch, /issue/bike-many-issues, /issue/insert, /issue/delete
/maintenance-task/fetch, /maintenance-task/insert, /maintenance-task/update
/technician/tasks, /technician/above-average-workload
```

**Analytics (Query/Reporting)**
```
/analytics/fleet-availability         → JSON with availability % per station
/analytics/fleet-health              → JSON with health score per bike
/analytics/technician-resolution-time → JSON with MTTR per technician
/analytics/maintenance-completion-rate → JSON with completion % by priority
```

**API Characteristics:**
- ✅ Parameterized query bindings (SQL injection protection)
- ✅ Connection pooling (handles concurrent requests)
- ✅ Structured JSON with column metadata (BI-ready format)
- ✅ Error handling (descriptive messages for constraint violations)

---

## 🛠️ Technology Stack

**Database:** Oracle RDBMS  
**Backend:** Node.js + Express  
**Query Layer:** 945 lines of production SQL logic  
**API Routes:** 390 lines of endpoint definitions  
**Patterns:** Async/await, connection pooling, middleware

## Local Development Setup

### Prerequisites

* Node.js 20+
* Docker Desktop
* Oracle Database Free Docker Container

### Start Oracle Database

```bash
docker start oracle-free
```

Verify that the container is running:

```bash
docker ps
```

### Configure Environment Variables

Update `Application/.env`:

```env
ORACLE_USER=system
ORACLE_PASS=Oracle123

ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_DBNAME=FREEPDB1

PORT=65535
```

### Install Dependencies

```bash
cd Application
npm install
```

### Initialize Database

Run:

```sql
Application/scripts/sql/db.sql
```

using the Oracle SQL Developer VS Code extension before starting the application for the first time.

### Run the Application

```bash
node server.js
```

The application should be available at:

```text
http://localhost:65535
```

## 📁 What's Inside

```
Application/
├── server.js                    # Express entry point
├── appController.js             # 20+ REST route definitions (390 lines)
├── appService.js                # Database service layer (945 lines of SQL logic)
├── scripts/sql/
│   └── db.sql                  # Complete schema: 15 tables, constraints, 50+ seed records
└── public/
    ├── index.html              # Interactive query UI
    ├── scripts.js              # Frontend logic
    └── styles.css              # Responsive design
```

---

## 🎓 Real-World Data Skills Demonstrated

### Database Design & Architecture
- ✅ Relational schema design (3NF normalization)
- ✅ Entity-relationship modeling with complex relationships
- ✅ Constraint-based data integrity enforcement
- ✅ OLTP vs. OLAP optimization tradeoffs

### SQL & Query Performance
- ✅ INNER/LEFT/SELF JOINs (multi-table queries)
- ✅ Aggregation functions (COUNT, AVG, SUM with GROUP BY)
- ✅ Advanced SQL (nested subqueries, correlated queries, HAVING clauses)
- ✅ Relational division (advanced SQL pattern)
- ✅ Date/time arithmetic and calculations
- ✅ Null handling (NULLS LAST, COALESCE)
- ✅ Query optimization (efficient aggregation, index-aware patterns)

### Analytics & Metrics
- ✅ KPI design (business-critical metrics from raw data)
- ✅ Metrics computation (conditional aggregation, ratio formulas)
- ✅ Performance benchmarking (individual vs. team averages)
- ✅ SLA tracking (completion rates, thresholds)

### Production Engineering
- ✅ Parameterized query construction (injection protection)
- ✅ Connection pooling (resource management under load)
- ✅ Error handling (graceful failure, descriptive messages)
- ✅ API design for data consumption (JSON, metadata, structure)

---

## 📊 Project Statistics

```
┌─────────────────────────────────────────┐
│            PROJECT STATISTICS           │
├─────────────────────────────────────────┤
│ 15 database tables (3NF normalized)     │
│ 20+ REST API endpoints                  │
│ 7 analytical SQL queries                │
│ 4 real-time KPI metrics                 │
│ 50+ test records for realism            │
│ 945 lines of query logic                │
│ 390 lines of API definitions            │
│ 100% parameterized queries              │
│ 0 SQL injection vectors                 │
└─────────────────────────────────────────┘
```

---

## 🎯 Project Summary

This system demonstrates end-to-end data engineering: designing normalized relational databases, writing production-grade SQL queries, building REST APIs for data exposure, and computing business-critical metrics. The architecture supports both high-performance operational transactions (OLTP) and complex analytical queries (OLAP), reflecting real-world data systems.

**Key Achievements:**
- Built a 15-table 3NF normalized schema with referential integrity enforcement
- Implemented 7 analytical SQL queries covering advanced patterns (joins, aggregations, relational division)
- Created REST API layer with parameterized queries, connection pooling, and error handling
- Computed 4 real-time KPIs that support operational decision-making
- Applied production data engineering patterns throughout

---

**Built to demonstrate relational database design, SQL analytics, and data engineering fundamentals.**
