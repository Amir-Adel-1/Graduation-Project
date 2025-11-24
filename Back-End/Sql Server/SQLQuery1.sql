
-- Global Variable
-------------------
--Print @@Language

-- ---------------------------- --

-- Local Variable 
------------------

Declare @Age Int = 20
Print @Age 


Declare @Name Varchar(20) = 'Amir'
Print @Name

Set @Name = 'Adel'
Print @Name   --> Update Amir > Adel

-- ============================================= -- 

-- DataType 
------------

-- int => 1234
-- bit => 0 ° 1 
-- dec => 200.100
-- smalldatetime => 2024-5-7 12:35
-- char => Fixed String À«» 
-- varchar => Dynamic ⁄«·ﬁœ 
-- N => Unicode  ··Ã„Ì⁄ «··€« 


-- ============================================= -- 


-- 1. DDL : Data Definition Language (Create - Alter - Drop)
-- ----------------------------------------------------------

-- 1.1. Create
---------------

-- To Create DataBase

Create DataBase Test_Project

-- Select DataBase

Use Test_Project

-- ------------------------------------ --

-- To Create Tables :-
----------------------

-- 1. Users

Create Table Users
(
	Id_User Int Primary Key Identity(1,1) ,   -- (Identity) => 1 2 3 4 
	First_Name NVarchar(15) Not Null ,  -- Required
	Last_Name NVarchar(15) Not Null ,
	Gender Char(1) Not Null ,
	Date_Of_Birth Date Not Null ,
	Email Varchar(255) Unique Not Null ,  -- ⁄‘«‰ «Œ·Ì «·«Ì„Ì· ›—Ìœ „Ì ﬂ——‘
	Password Varchar(50) Not Null ,
	Role NVarchar(10) Not Null ,
	Weight Decimal(5,2) Not Null ,
	Height Decimal(4,2) Not Null ,
	Blood_Type Char(3) Not Null ,
	Health_Status NVarchar(30) Not Null ,
	Create_At DateTime Not Null
)




------------------------------------------------------


Create Table Users_Addresses
(
	Id_User Int References Users(Id_User) ,
	Address NVarchar(100) Not Null ,
	Primary Key(Id_User , Address)
)

Create Table Users_Phones
(
	Id_User Int References Users(Id_User) ,
	Phone Varchar(11) Not Null ,
	Primary Key(Id_User , Phone)
)

Create Table Users_Chronic_Diseases
(
	Id_User Int References Users(Id_User) ,
	Chronic_Disease_Name NVarchar(255) ,
	Disease_Type NVarchar(255) ,
	Primary Key(Id_User , Chronic_Disease_Name)
)

Create Table Users_Allergies
(
	Id_User Int References Users(Id_User) ,
	Allergies NVarchar(255) ,
	Primary Key(Id_User , Allergies)
)

------------------------------------------------------

-- 2. Medicine_Requests

Create Table Medicine_Requests
(
	Id_Request Int Primary Key Identity(1,1) ,
	Medicine_Name NVarchar(50) Not Null ,
	Create_At DateTime Not Null ,
	Order_Status Char(1) ,
	Quantity NVarchar(10) Not Null ,
	Id_User Int References Users(Id_User) 
)

------------------------------------------------------

-- 3. Medicine_Availability   ( Weak Entity )

Create Table Medicine_Availability
(
	Available_Quantity Int Not Null ,
	Id_Request Int References Medicine_Requests(Id_Request) ,
	Id_User_PH Int References Users(Id_User) ,
	Primary Key(Id_Request , Id_User_PH)
)

------------------------------------------------------

-- 4. Cart 

Create Table Cart
(
	Id_Cart Int Primary Key Identity(1,1) ,
	Total_Products Int Not Null ,
	Total_Price Decimal(10,2) Not Null ,
	Id_User Int References Users(Id_User) 
)

------------------------------------------------------

-- 5. Cart_Items

Create Table Cart_Items
(
	Id_Cart_Item Int Primary Key Identity(1,1) ,
	Quantity Int Not Null ,
	Price Decimal(10,2) Not Null ,
	Product_API_Name NVarchar(255) Not Null ,
	Id_Cart Int References Cart(Id_Cart)
)

------------------------------------------------------

-- 6. Orders

Create Table Orders
(
	Id_Order Int Primary Key Identity(1,1) ,
	Order_Date Date ,
	Total_Amount Decimal(10,2) Not Null ,   -- 99,999,999.99
	Id_User Int References Users(Id_User) ,
	Id_Cart Int References Cart(Id_Cart) ,
	Id_Payment_Method Int References Payment_Methods(Id_Payment_Method)
)

------------------------------------------------------

-- 7. Favorite

Create Table Favorite
(
	Id_Favorite Int Primary Key Identity(1,1) ,
	Product_API_Name NVarchar(255) Not Null ,
	Id_User Int References Users(Id_User)
)

------------------------------------------------------

-- 8. Notifications

Create Table Notifications
(
	Id_Notification Int Primary Key Identity(1,1) ,
	Create_At DateTime Not Null ,
	Id_User Int References Users(Id_User) ,
	Id_Request Int References Medicine_Requests(Id_Request)
)

------------------------------------------------------

-- 9. Payment_Methods

Create Table Payment_Methods
(
	Id_Payment_Method Int Primary Key Identity(1,1) ,
	Payment_Method_Type NVarchar(10) Not Null
)

------------------------------------------------------

Alter Table Orders
Add Id_Payment_Method Int

Alter Table Orders
Add Foreign Key (Id_Payment_Method) References Payment_Methods(Id_Payment_Method)

-- ================================================ --

-- Insert :-
----------

-- 1. Users






