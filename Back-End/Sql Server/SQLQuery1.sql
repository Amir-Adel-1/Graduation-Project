
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
-- bit => 0 ، 1 
-- dec => 200.100
-- smalldatetime => 2024-5-7 12:35
-- char => Fixed String ثابت
-- varchar => Dynamic عالقد 
-- N => Unicode  للجميع اللغات


-- ============================================= -- 


-- 1. DDL : Data Definition Language (Create - Alter - Drop)
-- ----------------------------------------------------------

-- 1.1. Create
---------------

-- To Create DataBase

Create DataBase Test_Project01


-- Select DataBase

Use Test_Project01


-- ------------------------------------ --

-- To Create Tables :-
----------------------

-- 1. Users

Create Table Users
(
	Id_User Int Primary Key Identity(1,1) ,   -- (Identity) => 1 2 3 4 
	First_Name NVarchar(15) Not Null ,  -- Required
	Last_Name NVarchar(15) Not Null ,
	Gender Char(1) ,
	Date_Of_Birth Date ,
	Email Varchar(255) Unique Not Null ,  -- عشان اخلي الايميل فريد ميتكررش
	Password Varchar(50) Not Null ,
	Role NVarchar(10) Not Null ,
	Weight Decimal(5,2) ,
	Height Decimal(5,2) ,
	Blood_Type Char(3) ,
	Health_Status NVarchar(30) ,
	Create_At SMALLDATETIME NOT NULL DEFAULT GETDATE() ,
	Block_Status Char(1) NOT NULL DEFAULT 'A'    -- 'A' = Active  ,  'B' = Blocked
)

------------------------------------------------------


Create Table Users_Addresses
(
	Id_User Int References Users(Id_User) ,
	Address NVarchar(255) Not Null ,
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
	Create_At SMALLDATETIME NOT NULL DEFAULT GETDATE() ,
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

-- 6. Favorite

Create Table Favorite
(
	Id_Favorite Int Primary Key Identity(1,1) ,
	Product_API_Name NVarchar(255) Not Null ,
	Id_User Int References Users(Id_User)
)

------------------------------------------------------

-- 7. Notifications

Create Table Notifications
(
	Id_Notification Int Primary Key Identity(1,1) ,
	Create_At SMALLDATETIME NOT NULL DEFAULT GETDATE() ,
	Id_User Int References Users(Id_User) ,
	Id_Request Int References Medicine_Requests(Id_Request)
)

------------------------------------------------------

-- 8. Payment_Methods

Create Table Payment_Methods
(
	Id_Payment_Method Int Primary Key Identity(1,1) ,
	Payment_Method_Type Char(1) Not Null
)

------------------------------------------------------

-- 9. Orders

Create Table Orders
(
	Id_Order Int Primary Key Identity(1,1) ,
	Create_At_Order SMALLDATETIME NOT NULL DEFAULT GETDATE() ,
	Total_Amount Decimal(10,2) Not Null ,   -- 99,999,999.99
	Id_User Int References Users(Id_User) ,
	Id_Cart Int References Cart(Id_Cart) ,
	Id_Payment_Method Int References Payment_Methods(Id_Payment_Method)
)

------------------------------------------------------

--Alter Table Orders
--Add Id_Payment_Method Int

--Alter Table Orders
--Add Foreign Key (Id_Payment_Method) References Payment_Methods(Id_Payment_Method)

-- ================================================ --

-- 2. DML : Data Manipulation Language (Insert - Update - Delete)
---------------------------------------------------------------

-- 2.1 : Insert :-
----------------

-- ملحوظة محاولات الانسرت الفاشلة بتتحسب(اي دي) بتاعها
-- ااي انسرت فشل فا كدا اتكيش فالرام انو اتاخد 

-- Block_Status : 
-- 'A' = Active  
-- 'B' = Blocked

-- 1. Users

Insert Into Users
(First_Name , Last_Name , Gender , Date_Of_Birth , Email , Password , Role , Weight , Height , Blood_Type , Health_Status , Block_Status)
Values 
	('Ahmed' , 'Ali' , 'M' , '10/29/1990' , 'ahmed123@gmail.com' , 'Ahmed123' , 'User' , 81.5 , 172.5 , '+O' , 'لا يعاني من أي مشاكل صحية' , 'A') ,
	('Amr' , 'Sayed' , 'M' , '02/17/2000' , 'amr2000@gmail.com' , 'amr2000' , 'User' , 70.5 , 175.5 , '+A' , 'مدخن' , 'A') ,
	('محمد' , 'حسن' , 'M' , '07/05/1983' , 'mohamed55@gmail.com' , 'mohamed1983' , 'User' , 86.5 , 183.5 , '-O' , 'يعاني من أمراض مزمنة' , 'A') ,
	('علياء' , 'السيد' , 'F' , '06/22/1999' , 'aliaa321@gmail.com' , 'aliaa444' , 'User' , 72.5 , 162.5 , '-B' , 'لا يعاني من أي مشاكل صحية' , 'A') ,
	('صيدلية' , 'العزبي' , Null , Null , 'elezaby@gmail.com' , 'elezaby111' , 'Pharmacy' , Null , Null , Null , Null , 'A') ,
	('صيدلية' , 'الحياة' , Null , Null , 'alhayah@gmail.com' , 'alhayah1900' , 'Pharmacy' , Null , Null , Null , Null , 'A') ,
	('صيدلية' , 'Chefaa' , Null , Null , 'chefaa@gmail.com' , 'chefaa888' , 'Pharmacy' , Null , Null , Null , Null , 'A') ,
	('صيدلية' , 'Hkeema' , Null , Null , 'hkeema@gmail.com' , 'hkeema9191' , 'Pharmacy' , Null , Null , Null , Null , 'A')
 

-- -------------------------------------------------------------

-- Users_Addresses

Insert Into Users_Addresses
(Id_User , Address)
Values
	(1 , 'القاهرة – مدينة نصر – شارع الطيران – عمارة 14') ,
	(1 , 'الجيزة – فيصل – شارع الثلاثيني – برج الحرية') ,
	(2 , 'الإسكندرية – سيدي بشر – شارع خالد بن الوليد – عمارة الأندلس') ,
	(3 , 'المنصورة – حي الجامعة – شارع أحمد ماهر – برج النور')

-- -------------------------------------------------------------

-- Users_Phones

Insert Into Users_Phones
(Id_User , Phone)
Values
	(1 , '01124567890') ,
	(1 , '01098765432') ,
	(2 , '01234566789') ,
	(3 , '01555678901')

-- -------------------------------------------------------------

-- Users_Chronic_Diseases

Insert Into Users_Chronic_Diseases
(Id_User , Chronic_Disease_Name , Disease_Type)
Values
	(1 , 'السكر' , 'مزمن') ,
	(1 , 'ربو' , 'تنفسي') ,
	(2 , 'فقر الدم' , 'دموي') ,
	(3 , 'ضغط الدم' , 'مزمن')

-- -------------------------------------------------------------

-- Users_Allergies

Insert Into Users_Allergies
(Id_User , Allergies)
Values
	(1 , 'البنسلين') ,
	(1 , 'الغبار') ,
	(2 , 'المكسرات') ,
	(3 , 'الفراولة')

-- -------------------------------------------------------------

-- 2. Medicine_Requests

-- Notes:-
----------
-- 'P' => (Pending) -> قيد المراجعة
-- 'A' => (Accepted) -> مقبول
--
-- '1B' => (1 Blister) -> شريط واحد
-- '1P' => (1 Package) -> عبوة واحدة

Insert Into Medicine_Requests
(Medicine_Name , Order_Status , Quantity , Id_User)
Values
	('Panadol'     , 'P', '1P', 5) ,
	('Vitamin C'   , 'A', '1P', 3) ,
	('Brufen'      , 'P', '1B', 2) ,
	('باراسيتامول' , 'P', '1B' , 1) ,
	('إيبوبروفين'  , 'A', '1P' , 4) 

-- -------------------------------------------------------------

-- 3. Medicine_Availability

Insert Into Medicine_Availability
(Available_Quantity , Id_Request , Id_User_PH)
Values
	(1 , 1 , 5 ) ,
	(2 , 2 , 6 ) ,
	(1 , 3 , 7 )

-- -------------------------------------------------------------

-- 4. Cart

Insert Into Cart
(Total_Products , Total_Price , Id_User)
Values
	(3 , 430 , 1) ,
	(2 , 210 , 2) ,
	(1 , 81 , 3) ,
	(6 , 730 , 4)

-- -------------------------------------------------------------

-- 5. Cart_Items

Insert Into Cart_Items
(Quantity , Price , Product_API_Name , Id_Cart)
Values
	(3 , 600 , 'Panadol' , 1) ,
	(1 , 95 , 'Vitamin C' , 1) ,
	(5 , 820 , 'باراسيتامول' , 3) ,
	(5 , 820 , 'Brufen' , 3) 

-- -------------------------------------------------------------

-- 6. Favorite

Insert Into Favorite
(Product_API_Name , Id_User)
Values
	('باراسيتامول' , 1) ,
	('Vitamin C' , 2) ,
	('Panadol' , 3) ,
	('Brufen' , 4) 

-- -------------------------------------------------------------

-- 7. Notifications

Insert Into Notifications
(Id_User , Id_Request)
Values
	(1 , 1) ,
	(2 , 2) ,
	(3 , 3) ,
	(4 , 4) 
	
-- -------------------------------------------------------------

-- 8. Payment_Methods

-- Notes:-
----------
-- 'V' => (Visa) -> فيزا
-- 'C' => (Cash) -> كاش

Insert Into Payment_Methods
(Payment_Method_Type)
Values
	('V') ,
	('C') 


-- -------------------------------------------------------------

-- 9. Orders

Insert Into Orders
(Total_Amount , Id_User , Id_Cart , Id_Payment_Method)
Values
	(1200 , 1 , 1 , 1) ,
	(450 , 2 , 2 , 2) ,
	(150 , 3 , 3 , 1) ,
	(770 , 4 , 4 , 2) 

-- -------------------------------------------------------------



Go

CREATE TRIGGER TRG_Delete_User_Cleanup
ON Users
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Id_User INT;

    SELECT @Id_User = Id_User FROM deleted;

    ---------------------------------------------------------
    -- 1) Notifications (اللي فيها Id_Request مرتبط باليوزر)
    ---------------------------------------------------------
    DELETE FROM Notifications
    WHERE Id_User = @Id_User
       OR Id_Request IN (
            SELECT Id_Request 
            FROM Medicine_Requests 
            WHERE Id_User = @Id_User
       );

    ---------------------------------------------------------
    -- 2) Medicine_Availability (Weak Entity)
    ---------------------------------------------------------
    DELETE FROM Medicine_Availability
    WHERE Id_User_PH = @Id_User
       OR Id_Request IN (
            SELECT Id_Request 
            FROM Medicine_Requests 
            WHERE Id_User = @Id_User
       );

    ---------------------------------------------------------
    -- 3) Medicine_Requests
    ---------------------------------------------------------
    DELETE FROM Medicine_Requests
    WHERE Id_User = @Id_User;

    ---------------------------------------------------------
    -- 4) Favorite
    ---------------------------------------------------------
    DELETE FROM Favorite
    WHERE Id_User = @Id_User;

    ---------------------------------------------------------
    -- 5) Cart_Items → قبل مسح الكارت
    ---------------------------------------------------------
    DELETE FROM Cart_Items
    WHERE Id_Cart IN (
        SELECT Id_Cart FROM Cart WHERE Id_User = @Id_User
    );

    ---------------------------------------------------------
    -- 6) Orders → مرتبط بالكارت
    ---------------------------------------------------------
    DELETE FROM Orders
    WHERE Id_Cart IN (
        SELECT Id_Cart FROM Cart WHERE Id_User = @Id_User
    );

    ---------------------------------------------------------
    -- 7) Cart
    ---------------------------------------------------------
    DELETE FROM Cart
    WHERE Id_User = @Id_User;

    ---------------------------------------------------------
    -- 8) عناوين - أرقام - حساسية - أمراض مزمنة
    ---------------------------------------------------------
    DELETE FROM Users_Addresses WHERE Id_User = @Id_User;
    DELETE FROM Users_Phones WHERE Id_User = @Id_User;
    DELETE FROM Users_Chronic_Diseases WHERE Id_User = @Id_User;
    DELETE FROM Users_Allergies WHERE Id_User = @Id_User;

    ---------------------------------------------------------
    -- 9) أخيـــــرًا… مسح اليوزر نفسه
    ---------------------------------------------------------
    DELETE FROM Users WHERE Id_User = @Id_User;

END;



DELETE FROM Users WHERE Id_User = 1

-- -------------------------------------------------------------



-- 2.2 : Update :-
------------------

-- Update One Column In One Record

Update Users       -- هعدل علي جدول
Set Gender = 'F'   -- القيمة الجديدة اللي هديهالو
Where Id_User = 3  -- المستخدم اللي هو رقم 3

-- لاني لو مدتوش شرط هيروح يعدل عليهم كلهم


-- =========================

-- Update Many Columns In One Record

Update Users
Set First_Name = 'Omar' , Last_Name = 'Ahmed' , Gender = 'M'
Where Id_User = 5

-- لو مدتوش شرط هيطبق علي كل الريكوردز كلها

-- =========================

-- Update Many Records 

Update Orders
Set Total_Amount = Total_Amount - (Total_Amount * 0.1)
Where Id_Payment_Method = 1
And Total_Amount <= 4000

-- كدا انا عملت ابديت علي جدول الاوردرز 
-- علي عمود المبلغ الاجمالي 
-- اي حد دافع فيزا يتعملو خصم 10% عالمبلغ الاجمالي
-- المبلغ الاجمالي = المبلغ الاجمالي القديم - (المبلغ الاجمالي القديم  * 10 % خصم )ء
-- يعني بتروح تخصم 10 % من السعر


-- ممكن اعمل (اند) الطلب اللي عاوزة مثلا اكبر من او يساوي اجمالي 4000

-- -------------------------------------------------------------

-- 2.3 : Delete :-
------------------

-- Delete One Record

Delete From Users
Where Id_User = 6

-- بنقي حاجة تكون مبتكررش 

-- =========================

-- Delete Many Records

Delete From Users
Where Gender = 'F'

-- يحذف كل الستات مثلا
-- ملحوظة اللي همسحو ميكنش داخل في اي علاقة مع حاجة

-- ملحوظة الريكورد اللي يتحذف مينفعش يرجع تاني + ال(اي دي) بيتحفظ


-- -------------------------------------------------------------

-- 3. DQL : Data Query Language : Display (Select)
--------------------------------------------------

-- ملحوظة : السيليكت بستخدمها عشان اعرض داتا بنفس شكلها او شكل مختلف بنسبالي
-- لكن دا مش هيأثر في اصلها فالداتابيز


-- 3.1 : Select :-
----------------

Select First_Name , Last_Name
From Users

-- بسيليكت من جدول معين عمود معين
-- AutoComplete

-- =========================

Select First_Name , Last_Name , Gender
From Users
Where Gender = 'F'

-- بسيليكت من جدول معين بعواميد معينة بشرط معين

-- =========================

Select First_Name + Last_Name As [Full Name]
From Users

-- كدا هيعمل دمج بين العمودين بس بدون اسم عمود لان العمود دا ملوش وجود عندي

-- فنا ممكن اديهم اسم وهمي او مدهوش عادي

-- =========================

Select First_Name + ' ' + Last_Name As [Full Name]
From Users

-- ممكن اعمل سبيس فاضية فالنص مبنهم

-- =========================

Select *
From Users

-- كدا هو هيسليكتلي كل العواميد بتاعت اليوزرز

-- -------------------------------------------------------------

Select First_Name , Last_Name , Role
From Users
Where Role = 'Pharmacy'

-- اديتو شرط انو يظهرلي الصيدليات بس

-- =========================

Select First_Name , Last_Name , Create_At , Role
From Users
Where Create_At >= '2025-11-26'
And First_Name = 'صيدلية'
And Role = 'Pharmacy'

-- هنا انا ادتها شرط تكون تاريخ الانشاء قبل تاريخ مثلا معين يكون اكبر من او يساوي التاريخ دا
-- وكمان تكون صيدلية
-- وكمان تكون الرول بتاعتها صيدلية

-- =========================

Select Id_Order , Total_Amount , Id_User
From Orders
where Total_Amount <= 450 And Total_Amount >= 150

-- هنا انا ادتها شرط ان المبلغ الاجمالي يكون اصغر من او يساوي ال450
-- وكمان اكبر من او يساوي ال150

-- =========================

Select Id_Order , Total_Amount , Id_User
From Orders
where Total_Amount Between 150 And 450

-- هنا انا قولتلو يكون من رينج 150 ل450

-- =========================

Select Id_Order , Total_Amount , Id_User
From Orders
where Total_Amount Not Between 150 And 450

-- كدا انا بقولو اللي مبيساووش الرنج دا يعني اي حاجة براهم

-- =========================


Select Id_Request , Medicine_Name , Quantity , Id_User , Order_Status
From Medicine_Requests
Where Quantity = '1P' And Order_Status = 'B'

-- هاتلي الكمية اللي مطلوب فيها شريط 1 ويكون الحالة بتاعتها قيد المراجعة

-- =========================

Select Id_Request , Id_User , Order_Status
From Medicine_Requests
Where Order_Status In ('B' , 'A')

-- انا كدا عاوز حالت الطلبات اللي اتقبلت واللي لسة قيد المراجعة

-- Notes :-
-----------
-- Not In         يعني لا يساوي اللي كاتبو
-- Is Null       لو عاوز اجيب حاجة نل 
-- Is Not Null   لايساوي النل  
-- لما اكون عاوز اجيب حاجة نل مبحطش يساوي بستبدلها ب ايز

-- -------------------------------------------------------------

-- Like -> Pattern   تطابق او توافر
-- اني عاوز اجيب فاليو بشكل معين

/*
	% => Represent Zero Or More Character    عدد من الحروف معرفوش
	_ => Represent One Character      حرف ما واحد مليش دعوة بي
	__ => فوت اول حرفين وهات ال3
	[] => Match Any Single Character Within The Range     يطابق اي حرف ضمن النطاق المحدد
	[^] => Match Any Single Character Not Within The Range   يطابق اي حرف خارج النطاق المحدد
*/


/*
	_a% 
		_  -> حرف ما واحد مليش دعوة بي
		a  -> الحرف اللي عاوزة
		%  -> عدد من الحروف معرفوش
*/

Select First_Name 
From Users
Where First_Name Like 'A%'

-- هنا انا عاوز كل الاسامي اللي بتبدء بحرف اللي هحددو

-- =========================

Select First_Name 
From Users
Where First_Name Like '_A%'

-- الناس اللي تاني حرف من اسمها في حرف كذا 

-- =========================

Select First_Name 
From Users
Where First_Name Like '[Ah]%'

-- اي حد في اسمو الحرفين دول هيجبهولي او اول حرف عادي

-- =========================

Select First_Name 
From Users
Where First_Name Like '[^Ah]%'

-- اي حروف غير الحروف اللي كتبها دي

-- -------------------------------------------------------------

-- Distinct : Used To Display Data Without Any Duplication

-- بستخدمها عشان اعرض داتا منغير اي تكرار

Select Distinct Gender
From Users
Where Gender Is Not Null

-- بستخدمها عشان امتع التكرار

-- -------------------------------------------------------------

-- Order By 

-- Sorting [ Ascending , Descending ]
-- يعني ترتيب تصاعدي من صغير للكبير او من كبير للصغير

-- ASC ->  Default  من صغير للكبير
-- DESC -> من كبير للصغير


Select *
From Users

-- كدا هو جابلي كلو بترتيب الداتابيز اللي هو بالمفتاح الرئيسي

-- =========================

Select *
From Orders
Order By Total_Amount desc

-- خليتو رتبلي عمود الاجمالي من كبير للصغير

-- =========================

Select First_Name , Last_Name
From Users
Order By First_Name ASC

-- هيرتب الاسم الاول ترتيب ابجدي

-- =========================

Select First_Name , Last_Name
From Users
Order By 2

-- العد بيبدء من 1 عادي مش 0
--  هيرتب العمود التاني وكذللك

-- في حالة حطيت رقم مش موجود بيقولو اوت او رينج

-- -------------------------------------------------------------

-- Joins :-
-----------

-- 1. Cross Joins (Cartisian Product)

-- 2. Inner Joins 

-- 3. Outer Joins

-- 4. Self Joins


-- اللي بقدر من خلالها اتعامل مع اكتر من اتنين جدول في نفس الوقت

-- -----------------------------------------

-- 1. Cross Joins (Cartisian Product)


-- OLD - ANSI

Select U.First_Name , O.Total_Amount
From Users U , Orders O


-- NEW - MicroSoft

Select U.First_Name , O.Total_Amount
From Users U Cross Join Orders O

-- Users = 8  , Orders = 4   => 8 * 4 = 32 row
-- خد ال8 بتوع اليوزر ضربهم فالطلبات 
-- يعني كل طلب واحد مع كل اليوزرز

-- Fake Data = داتا مش حقيقية 
-- لزمتها لما يكون عندي احتمالات بين داتا وبعضها







