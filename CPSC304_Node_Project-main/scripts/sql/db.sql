drop table Component;
drop table ConsistOf;
drop table Need;
drop table BikeStation;
drop table Bike;
drop table RegularBike;
drop table EBike;
drop table StationInfo;
drop table StationAddress;
drop table CustomerContact;
drop table CustomerAccount;
drop table Report;
drop table IssueRule;
drop table IssueRecord;
drop table MaintenanceTask;
drop table Maintenance;
drop table Staff;
drop table Technician;
drop table Inspector;
drop table Manager;

CREATE TABLE Component (
ComponentID CHAR(4),
StockQuantity INTEGER CHECK (StockQuantity >= 0),
Material VARCHAR(10), 
Price FLOAT CHECK (Price >= 0),
Name VARCHAR(20) UNIQUE,
PRIMARY KEY (ComponentID)
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
ON UPDATE CASCADE
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
ON UPDATE CASCADE
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
ON UPDATE CASCADE
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

CREATE TABLE IssueRule (
ConditionScore FLOAT,
    	Description CLOB,
    	Result VARCHAR2(20) NOT NULL,
    	PRIMARY KEY (ConditionScore, Description)
);

CREATE TABLE IssueRecord (
IssueID CHAR(4),
ReportTime DATETIME,
    	ConditionScore FLOAT NOT NULL CHECK (ConditionScore BETWEEN 0 AND 5),
    	Description CLOB NOT NULL,
    	BikeID CHAR(4) NOT NULL,
    	MaintenanceID CHAR(4),
    	InspectorID CHAR(4),
    	PRIMARY KEY (IssueID),
    	FOREIGN KEY (ConditionScore, Description) REFERENCES IssueRule(ConditionScore, Description),
    	FOREIGN KEY (BikeID) REFERENCES Bike(BikeID),
    	FOREIGN KEY (MaintenanceID) REFERENCES Maintenance(MaintenanceID),
    	FOREIGN KEY (InspectorID) REFERENCES Inspector(StaffID)
);

CREATE TABLE MaintenanceTask (
TaskID CHAR(4),
MaintenanceID CHAR(4) NOT NULL,
Duration TIME,
StartTime DATETIME,
EndTime DATETIME,
TechnicianID CHAR(4),
PRIMARY KEY (TaskID, MaintenanceID),
FOREIGN KEY (MaintenanceID) REFERENCES Maintenance(MaintenanceID)
ON DELETE CASCADE,
FOREIGN KEY (TechnicianID) REFERENCES Technician(StaffID)
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
REFERENCES Staff(StaffID) ON DELETE CASCADE
);

CREATE TABLE Inspector (
StaffID CHAR(4),
PRIMARY KEY (StaffID),
FOREIGN KEY (StaffID) REFERENCES Staff(StaffID) ON DELETE CASCADE
);

CREATE TABLE Manager (
StaffID CHAR(4),
    	PRIMARY KEY (StaffID),
    	FOREIGN KEY (StaffID) REFERENCES Staff(StaffID) ON DELETE CASCADE
);

