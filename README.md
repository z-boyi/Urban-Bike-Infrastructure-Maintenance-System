# Urban Bike Infrastructure Maintenance System

## Project Summary
This project models an urban bike infrastructure maintenance system for a city-wide shared bicycle network. The system manages bicycles deployed across stations and supports operations such as issue reporting, maintenance task management, and staff coordination.

The goal of the system is to help ensure that bikes remain safe, functional, and available for public use by tracking maintenance workflows, reported issues, and repair activities.

## Group Members
- Boyi Zhang (bzhang54)
- Runtan Zhang (rzhan114)
- Xinghao Huang (xh512)

## System Features
The application demonstrates how a database system can support real-world maintenance operations.

Main features include:
- **Bike Management:**
   - Track bikes deployed across stations
  - Store bike information such as brand, status, and service history

- **Issue Reporting:**
  - Record issues reported by users
  - Track condition scores and inspection results

- **Maintenance Management:**
  - Assign maintenance records and tasks
  - Track technician workload and repair progress
  - Record components required for repairs

- **Staff Management:**
  - Model different staff roles including managers, technicians, and inspectors

## Database Design
The database models several core entities in the bike maintenance system:

Key entities include:
- **Bike:** Represents an individual bike in the system, storing its identifying and operational information.
- **Station:** Represents a bike station in the system, and stores location information and capacity details.
- **IssueRecord:** Represents reported problems associated with bikes.
- **IssueRule:** Represents predefined rules that determine the outcome of a reported issue based on its description and condition score.
- **Maintenance:** Represents a maintenance type associated with one or more issues.
- **MaintenanceTask:** Represents individual tasks within a maintenance record.
- **Staff:** Represents employees in the system.
- **Technician:** Represents staff members responsible for performing maintenance tasks.

The system captures relationships between these entities to support the operations demonstrated in the application:
- Bikes are located at stations, allowing the system to track where bikes are deployed.
- Users can view and search bikes based on attributes such as status, brand, or station.
- Issues can be reported for bikes, recording problem descriptions and inspection information.
- Maintenance tasks are assigned to technicians, allowing the system to track repair activities.
- The system can retrieve maintenance tasks performed by a specific technician.
- The system can identify technicians with above-average workloads using aggregation queries.
- The system can also identify technicians who have worked on all maintenance tasks, demonstrating a relational division query.

## Technology Stack
**Database:** Oracle

**Backend:** Node.js / Express

**Frontend:** HTML / JavaScript / CSS

**Query Language:** SQL

## Repository Structure
```text
.
├── Application
│   ├── README.md
│   ├── appController.js
│   ├── appService.js
│   ├── draft
│   │   ├── README.md
│   │   ├── dev
│   │   │   ├── index_BZ.html
│   │   │   ├── index_RZ.html
│   │   │   ├── index_XH.html
│   │   │   ├── scripts_BZ.js
│   │   │   ├── scripts_RZ.js
│   │   │   └── scripts_XH.js
│   │   ├── endpoints
│   │   │   ├── endpoints_BZ.js
│   │   │   ├── endpoints_RZ.js
│   │   │   └── endpoints_XH.js
│   │   └── queries
│   │       ├── bikeQueries_BZ.js
│   │       ├── issueQueries_RZ.js
│   │       └── maintenanceQueries_XH.js
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── index.html
│   │   ├── loading_100px.gif
│   │   ├── scripts.js
│   │   └── styles.css
│   ├── remote-start.sh
│   ├── scripts
│   │   ├── mac
│   │   │   ├── db-tunnel.sh
│   │   │   ├── instantclient-setup.sh
│   │   │   └── server-tunnel.sh
│   │   ├── sql
│   │   │   └── db.sql
│   │   └── win
│   │       ├── db-tunnel.cmd
│   │       ├── instantclient-setup.cmd
│   │       └── server-tunnel.cmd
│   ├── server.js
│   └── utils
│       └── envUtil.js
├── Project Deliverables
│   ├── CPSC 304 Group 80 Milestone 1.pdf
│   ├── CPSC 304 Group 80 Milestone 2.pdf
│   ├── CPSC 304 Group 80 Milestone 3.pdf
│   ├── CPSC 304 Group 80 Milestone 4.pdf
│   └── README.md
└── README.md
```

## Example Queries Implemented
The system supports several database queries demonstrating relational database operations:

Examples include:

- **Retrieve all bikes in the system**: Displays all bike records stored in the database.

- **Search bikes using filters** such as status, brand, or postal code: Allows users to find bikes based on specific conditions.

- **Count the number of bikes at each station**: Aggregates bike records to show how many bikes are deployed at each station.

- **Retrieve issue records with selected attributes**: Allows users to view specific information from issue records.

- **Find bikes with reported issues**: Identifies bikes that currently have one or more recorded issues.

- **Insert new maintenance tasks**: Creates maintenance task records and assigns them to technicians.

- **Retrieve maintenance tasks assigned to a technician**: Displays the maintenance tasks performed by a specific technician.

- **Identify technicians with above-average workload**: Compares technician workloads and returns those who have completed more tasks than the average.

- **Find technicians who have worked on all maintenance tasks**: Identifies technicians who have participated in every maintenance task recorded in the system.

- **Update the status of a bike**: Allows the system to modify a bike's status when its condition or availability changes.

- **Delete issue or maintenance records when needed**: Removes records from the system when issues are resolved or maintenance data needs to be cleaned.
