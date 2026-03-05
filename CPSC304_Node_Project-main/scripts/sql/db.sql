CREATE TABLE Component (
ComponentID CHAR(4),
StockQuantity INTEGER CHECK (StockQuantity >= 0),
Material VARCHAR(10), 
Price FLOAT CHECK (Price >= 0),
Name VARCHAR(20) UNIQUE,
PRIMARY KEY (ComponentID)
);