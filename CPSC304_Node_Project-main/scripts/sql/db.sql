-- drop tables in dependency order
DROP TABLE Report CASCADE CONSTRAINTS;
DROP TABLE Need CASCADE CONSTRAINTS;
DROP TABLE ConsistOf CASCADE CONSTRAINTS;
DROP TABLE IssueRecord CASCADE CONSTRAINTS;
DROP TABLE MaintenanceTask CASCADE CONSTRAINTS;
DROP TABLE RegularBike CASCADE CONSTRAINTS;
DROP TABLE EBike CASCADE CONSTRAINTS;
DROP TABLE CustomerAccount CASCADE CONSTRAINTS;
DROP TABLE CustomerContact CASCADE CONSTRAINTS;
DROP TABLE StationAddress CASCADE CONSTRAINTS;
DROP TABLE StationInfo CASCADE CONSTRAINTS;
DROP TABLE Manager CASCADE CONSTRAINTS;
DROP TABLE Inspector CASCADE CONSTRAINTS;
DROP TABLE Technician CASCADE CONSTRAINTS;
DROP TABLE Staff CASCADE CONSTRAINTS;
DROP TABLE IssueRule CASCADE CONSTRAINTS;
DROP TABLE Maintenance CASCADE CONSTRAINTS;
DROP TABLE Component CASCADE CONSTRAINTS;
DROP TABLE Bike CASCADE CONSTRAINTS;
DROP TABLE BikeStation CASCADE CONSTRAINTS;


-- create tables in dependency order
CREATE TABLE BikeStation (
	StreetAddress VARCHAR(100),
	PostalCode CHAR(6),
	StationName VARCHAR(20) NOT NULL,
	PRIMARY KEY(StreetAddress, PostalCode)
);

CREATE TABLE Bike (
	BikeID CHAR(4),
	Brand VARCHAR(10),
	LastServiceDate DATE,
	DeploymentDate DATE,
	Status VARCHAR(10) NOT NULL,
	StreetAddress VARCHAR(100),
	PostalCode CHAR(6),
	PRIMARY KEY (BikeID),
	FOREIGN KEY (StreetAddress, PostalCode) REFERENCES BikeStation(StreetAddress, PostalCode)
);

CREATE TABLE RegularBike (
	BikeID CHAR(4),
	PRIMARY KEY (BikeID),
	FOREIGN KEY (BikeID) REFERENCES Bike(BikeID) 
		ON DELETE CASCADE
);

CREATE TABLE EBike (
	BikeID CHAR(4),
	BatteryLevel INTEGER CHECK (BatteryLevel BETWEEN 0 AND 100),
	PRIMARY KEY (BikeID),
	FOREIGN KEY (BikeID) REFERENCES Bike(BikeID) 
		ON DELETE CASCADE
);

CREATE TABLE Component (
	ComponentID CHAR(4),
	StockQuantity INTEGER CHECK (StockQuantity >= 0),
	Material VARCHAR(10), 
	Price FLOAT CHECK (Price >= 0),
	Name VARCHAR(20) UNIQUE,
	PRIMARY KEY (ComponentID)
);

CREATE TABLE Maintenance (
	MaintenanceID CHAR(4),
	PriorityLevel INTEGER CHECK (PriorityLevel >= 0),
	CompletionStatus VARCHAR(10) NOT NULL,
	RepairQuotation CLOB,
	PRIMARY KEY (MaintenanceID)
);

 CREATE TABLE Staff (
	StaffID CHAR(4),
	Name VARCHAR(30),
	Contact VARCHAR(20),
	AssignedArea CLOB,
	RoleID CHAR(4),
	ManagerID CHAR(4),
	PRIMARY KEY (StaffID),
	FOREIGN KEY (ManagerID) REFERENCES Staff(StaffID) 
);

CREATE TABLE Technician (
	StaffID CHAR(4),
	PRIMARY KEY (StaffID),
	FOREIGN KEY (StaffID)
	REFERENCES Staff(StaffID) 
		ON DELETE CASCADE
);

CREATE TABLE Inspector (
	StaffID CHAR(4),
	PRIMARY KEY (StaffID),
	FOREIGN KEY (StaffID) REFERENCES Staff(StaffID) 
		ON DELETE CASCADE
);

CREATE TABLE MaintenanceTask (
	TaskID CHAR(4),
	MaintenanceID CHAR(4) NOT NULL,
	Duration INTERVAL DAY TO SECOND,
	StartTime TIMESTAMP,
	EndTime TIMESTAMP,
	TechnicianID CHAR(4),
	PRIMARY KEY (TaskID, MaintenanceID),
	FOREIGN KEY (MaintenanceID) REFERENCES Maintenance(MaintenanceID)
		ON DELETE CASCADE,
	FOREIGN KEY (TechnicianID) REFERENCES Technician(StaffID)
);

CREATE TABLE IssueRule (
	ConditionScore FLOAT,
	Description VARCHAR(200),
	Result VARCHAR2(20) NOT NULL,
	PRIMARY KEY (ConditionScore, Description)
);

CREATE TABLE IssueRecord (
	IssueID CHAR(4),
	ReportTime TIMESTAMP,
	ConditionScore FLOAT NOT NULL CHECK (ConditionScore BETWEEN 0 AND 5),
	Description VARCHAR(200) NOT NULL,
	BikeID CHAR(4) NOT NULL,
	MaintenanceID CHAR(4),
	InspectorID CHAR(4),
	PRIMARY KEY (IssueID),
	FOREIGN KEY (ConditionScore, Description) REFERENCES IssueRule(ConditionScore, Description),
	FOREIGN KEY (BikeID) REFERENCES Bike(BikeID),
	FOREIGN KEY (MaintenanceID) REFERENCES Maintenance(MaintenanceID),
	FOREIGN KEY (InspectorID) REFERENCES Inspector(StaffID)
);


CREATE TABLE ConsistOf (
	ComponentID CHAR(4),
	BikeID CHAR(4),
	PRIMARY KEY (ComponentID, BikeID),
	FOREIGN KEY (ComponentID) REFERENCES Component(ComponentID) 
		ON DELETE CASCADE,
	FOREIGN KEY (BikeID) REFERENCES Bike(BikeID) 
		ON DELETE CASCADE
);

CREATE TABLE Need (
	ComponentID CHAR(4),
	TaskID CHAR(4),
	MaintenanceID CHAR(4),
	PRIMARY KEY (ComponentID, TaskID, MaintenanceID),
	FOREIGN KEY (ComponentID) REFERENCES Component(ComponentID) 
		ON DELETE CASCADE,
	FOREIGN KEY (TaskID, MaintenanceID)  REFERENCES MaintenanceTask(TaskID,MaintenanceID) 
		ON DELETE CASCADE
);


CREATE TABLE StationInfo (
	StationName VARCHAR(20),
	NumberOfBike INTEGER CHECK (NumberOfBike >= 0),
	InstallationDate DATE,
	TotalCapacity INTEGER CHECK (TotalCapacity >= 0),
	PRIMARY KEY (StationName)
);

CREATE TABLE StationAddress (
	StreetAddress VARCHAR(100),
	PostalCode CHAR(6),
	StationName VARCHAR(20) NOT NULL,
	PRIMARY KEY (StreetAddress, PostalCode),
	FOREIGN KEY (StationName) REFERENCES StationInfo(StationName) 
		ON DELETE CASCADE 
);

CREATE TABLE CustomerContact (
	Email VARCHAR(30),
	Name VARCHAR(30),
	Address VARCHAR(100),
	PhoneNumber VARCHAR(20),
	PRIMARY KEY (Email)
);

CREATE TABLE CustomerAccount (
	CustomerID CHAR(4),
	Email VARCHAR(30) UNIQUE NOT NULL,
	RegisteredDate DATE NOT NULL,
	PRIMARY KEY (CustomerID),
	FOREIGN KEY (Email) REFERENCES CustomerContact(Email) 
		ON DELETE CASCADE
);

CREATE TABLE Report (
	CustomerID CHAR(4),
	IssueID CHAR(4),
	PRIMARY KEY (CustomerID, IssueID),
	FOREIGN KEY (CustomerID) REFERENCES CustomerAccount(CustomerID) 
		ON DELETE CASCADE,
	FOREIGN KEY (IssueID) REFERENCES IssueRecord(IssueID)
		ON DELETE CASCADE
);

CREATE TABLE Manager (
	StaffID CHAR(4),
    PRIMARY KEY (StaffID),
    FOREIGN KEY (StaffID) REFERENCES Staff(StaffID) 
		ON DELETE CASCADE
);

-- insert at least 5 tuples per each table

-- BikeStation
INSERT INTO BikeStation VALUES ('123 Main St','V6T1Z4','UBC Station');
INSERT INTO BikeStation VALUES ('456 Oak St','V6T1Z5','Downtown Station');
INSERT INTO BikeStation VALUES ('789 Pine St','V6T1Z6','CityHall Station');
INSERT INTO BikeStation VALUES ('321 Cedar St','V6T1Z7','Kits Station');
INSERT INTO BikeStation VALUES ('654 Maple St','V6T1Z8','Granville Station');


-- Bike (RegularBike)
INSERT INTO Bike VALUES ('B001','Trek',DATE '2025-01-01',DATE '2025-01-10','Active','123 Main St','V6T1Z4');
INSERT INTO Bike VALUES ('B002','Giant',DATE '2025-01-02',DATE '2025-01-11','Active','123 Main St','V6T1Z4');
INSERT INTO Bike VALUES ('B003','Norco',DATE '2025-01-03',DATE '2025-01-12','Repair','456 Oak St','V6T1Z5');
INSERT INTO Bike VALUES ('B004','Cube',DATE '2025-01-04',DATE '2025-01-13','Active','456 Oak St','V6T1Z5');
INSERT INTO Bike VALUES ('B005','Special',DATE '2025-01-05',DATE '2025-01-14','Active','789 Pine St','V6T1Z6');


-- Bike (EBike)
INSERT INTO Bike VALUES ('B006','Trek',DATE '2025-01-06',DATE '2025-01-15','Active','321 Cedar St','V6T1Z7');
INSERT INTO Bike VALUES ('B007','Giant',DATE '2025-01-07',DATE '2025-01-16','Active','321 Cedar St','V6T1Z7');
INSERT INTO Bike VALUES ('B008','Norco',DATE '2025-01-08',DATE '2025-01-17','Repair','654 Maple St','V6T1Z8');
INSERT INTO Bike VALUES ('B009','Cube',DATE '2025-01-09',DATE '2025-01-18','Active','654 Maple St','V6T1Z8');
INSERT INTO Bike VALUES ('B010','Special',DATE '2025-01-10',DATE '2025-01-19','Active','789 Pine St','V6T1Z6');


-- RegularBike
INSERT INTO RegularBike VALUES ('B001');
INSERT INTO RegularBike VALUES ('B002');
INSERT INTO RegularBike VALUES ('B003');
INSERT INTO RegularBike VALUES ('B004');
INSERT INTO RegularBike VALUES ('B005');


-- EBike
INSERT INTO EBike VALUES ('B006',80);
INSERT INTO EBike VALUES ('B007',70);
INSERT INTO EBike VALUES ('B008',60);
INSERT INTO EBike VALUES ('B009',90);
INSERT INTO EBike VALUES ('B010',75);


-- Component
INSERT INTO Component VALUES ('C001',50,'Steel',25,'Brake');
INSERT INTO Component VALUES ('C002',40,'Aluminum',35,'Wheel');
INSERT INTO Component VALUES ('C003',30,'Rubber',15,'Tire');
INSERT INTO Component VALUES ('C004',20,'Plastic',12,'Seat');
INSERT INTO Component VALUES ('C005',25,'Steel',18,'Chain');


-- Maintenance
INSERT INTO Maintenance VALUES ('M001',1,'Pending','Brake repair');
INSERT INTO Maintenance VALUES ('M002',2,'Complete','Wheel replacement');
INSERT INTO Maintenance VALUES ('M003',1,'Pending','Tire repair');
INSERT INTO Maintenance VALUES ('M004',3,'Pending','Seat replacement');
INSERT INTO Maintenance VALUES ('M005',2,'Complete','General inspection');


-- Staff (Manager)
INSERT INTO Staff VALUES ('S011','Alice','111','UBC','R1','S011');
INSERT INTO Staff VALUES ('S012','Bob','222','Downtown','R1','S012');
INSERT INTO Staff VALUES ('S013','Carol','333','CityHall','R1','S013');
INSERT INTO Staff VALUES ('S014','David','444','Kits','R1','S014');
INSERT INTO Staff VALUES ('S015','Emma','555','Granville','R1','S015');


-- Staff (Technician)
INSERT INTO Staff VALUES ('S001','Tom','111','UBC','R2','S011');
INSERT INTO Staff VALUES ('S002','Jerry','222','UBC','R2','S011');
INSERT INTO Staff VALUES ('S003','Mark','333','Downtown','R2','S012');
INSERT INTO Staff VALUES ('S004','Luke','444','CityHall','R2','S013');
INSERT INTO Staff VALUES ('S005','John','555','Kits','R2','S014');


-- Staff (Inspector)
INSERT INTO Staff VALUES ('S006','Anna','666','UBC','R3','S011');
INSERT INTO Staff VALUES ('S007','Bella','777','Downtown','R3','S012');
INSERT INTO Staff VALUES ('S008','Cindy','888','CityHall','R3','S013');
INSERT INTO Staff VALUES ('S009','Diana','999','Kits','R3','S014');
INSERT INTO Staff VALUES ('S010','Eva','101','Granville','R3','S015');


-- Technician
INSERT INTO Technician VALUES ('S001');
INSERT INTO Technician VALUES ('S002');
INSERT INTO Technician VALUES ('S003');
INSERT INTO Technician VALUES ('S004');
INSERT INTO Technician VALUES ('S005');


-- Inspector
INSERT INTO Inspector VALUES ('S006');
INSERT INTO Inspector VALUES ('S007');
INSERT INTO Inspector VALUES ('S008');
INSERT INTO Inspector VALUES ('S009');
INSERT INTO Inspector VALUES ('S010');


-- MaintenanceTask
INSERT INTO MaintenanceTask VALUES ('T001','M001',INTERVAL '1' HOUR,TIMESTAMP '2026-01-01 10:00:00',TIMESTAMP '2026-01-01 11:00:00','S001');
INSERT INTO MaintenanceTask VALUES ('T002','M002',INTERVAL '2' HOUR,TIMESTAMP '2026-01-02 10:00:00',TIMESTAMP '2026-01-02 12:00:00','S002');
INSERT INTO MaintenanceTask VALUES ('T003','M003',INTERVAL '1' HOUR,TIMESTAMP '2026-01-03 09:00:00',TIMESTAMP '2026-01-03 10:00:00','S003');
INSERT INTO MaintenanceTask VALUES ('T004','M004',INTERVAL '3' HOUR,TIMESTAMP '2026-01-04 08:00:00',TIMESTAMP '2026-01-04 11:00:00','S004');
INSERT INTO MaintenanceTask VALUES ('T005','M005',INTERVAL '1' HOUR,TIMESTAMP '2026-01-05 13:00:00',TIMESTAMP '2026-01-05 14:00:00','S005');


-- IssueRule
INSERT INTO IssueRule VALUES (1,'Minor scratch','Ignore');
INSERT INTO IssueRule VALUES (2,'Loose brake','Repair');
INSERT INTO IssueRule VALUES (3,'Flat tire','Repair');
INSERT INTO IssueRule VALUES (4,'Broken chain','Urgent');
INSERT INTO IssueRule VALUES (5,'Frame damage','Replace');

-- IssueRecord
INSERT INTO IssueRecord VALUES ('I001',TIMESTAMP '2026-01-01 09:00:00',2,'Loose brake','B001','M001','S006');
INSERT INTO IssueRecord VALUES ('I002',TIMESTAMP '2026-01-02 09:00:00',3,'Flat tire','B002','M002','S007');
INSERT INTO IssueRecord VALUES ('I003',TIMESTAMP '2026-01-03 09:00:00',4,'Broken chain','B003','M003','S008');
INSERT INTO IssueRecord VALUES ('I004',TIMESTAMP '2026-01-04 09:00:00',1,'Minor scratch','B004','M004','S009');
INSERT INTO IssueRecord VALUES ('I005',TIMESTAMP '2026-01-05 09:00:00',5,'Frame damage','B005','M005','S010');


-- ConsistOf
INSERT INTO ConsistOf VALUES ('C001','B001');
INSERT INTO ConsistOf VALUES ('C002','B002');
INSERT INTO ConsistOf VALUES ('C003','B003');
INSERT INTO ConsistOf VALUES ('C004','B004');
INSERT INTO ConsistOf VALUES ('C005','B005');


-- Need
INSERT INTO Need VALUES ('C001','T001','M001');
INSERT INTO Need VALUES ('C002','T002','M002');
INSERT INTO Need VALUES ('C003','T003','M003');
INSERT INTO Need VALUES ('C004','T004','M004');
INSERT INTO Need VALUES ('C005','T005','M005');


-- StationInfo
INSERT INTO StationInfo VALUES ('UBC Station',20,DATE '2024-01-01',40);
INSERT INTO StationInfo VALUES ('Downtown Station',25,DATE '2024-02-01',50);
INSERT INTO StationInfo VALUES ('CityHall Station',18,DATE '2024-03-01',35);
INSERT INTO StationInfo VALUES ('Kits Station',15,DATE '2024-04-01',30);
INSERT INTO StationInfo VALUES ('Granville Station',22,DATE '2024-05-01',45);


-- StationAddress
INSERT INTO StationAddress VALUES ('123 Main St','V6T1Z4','UBC Station');
INSERT INTO StationAddress VALUES ('456 Oak St','V6T1Z5','Downtown Station');
INSERT INTO StationAddress VALUES ('789 Pine St','V6T1Z6','CityHall Station');
INSERT INTO StationAddress VALUES ('321 Cedar St','V6T1Z7','Kits Station');
INSERT INTO StationAddress VALUES ('654 Maple St','V6T1Z8','Granville Station');


-- CustomerContact
INSERT INTO CustomerContact VALUES ('alice@email.com','Alice','UBC','111');
INSERT INTO CustomerContact VALUES ('bob@email.com','Bob','Downtown','222');
INSERT INTO CustomerContact VALUES ('carol@email.com','Carol','CityHall','333');
INSERT INTO CustomerContact VALUES ('david@email.com','David','Kits','444');
INSERT INTO CustomerContact VALUES ('emma@email.com','Emma','Granville','555');


-- CustomerAccount
INSERT INTO CustomerAccount VALUES ('CU01','alice@email.com',DATE '2025-01-01');
INSERT INTO CustomerAccount VALUES ('CU02','bob@email.com',DATE '2025-01-02');
INSERT INTO CustomerAccount VALUES ('CU03','carol@email.com',DATE '2025-01-03');
INSERT INTO CustomerAccount VALUES ('CU04','david@email.com',DATE '2025-01-04');
INSERT INTO CustomerAccount VALUES ('CU05','emma@email.com',DATE '2025-01-05');


-- Report
INSERT INTO Report VALUES ('CU01','I001');
INSERT INTO Report VALUES ('CU02','I002');
INSERT INTO Report VALUES ('CU03','I003');
INSERT INTO Report VALUES ('CU04','I004');
INSERT INTO Report VALUES ('CU05','I005');


-- Manager
INSERT INTO Manager VALUES ('S011');
INSERT INTO Manager VALUES ('S012');
INSERT INTO Manager VALUES ('S013');
INSERT INTO Manager VALUES ('S014');
INSERT INTO Manager VALUES ('S015');
