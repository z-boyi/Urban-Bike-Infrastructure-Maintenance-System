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
	ManagerID CHAR(4) NOT NULL,
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

