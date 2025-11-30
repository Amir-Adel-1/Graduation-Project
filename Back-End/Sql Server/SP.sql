

USE Test_Pro300


-- Stored Procedures :-
-----------------------

-- 1. Users
-------------

-- 1.1 : Register_User
-- عمل حساب جديد

Go

CREATE PROCEDURE Register_User
(
    @First_Name NVARCHAR(15),
    @Last_Name NVARCHAR(15),
    @Gender CHAR(1),
    @Date_Of_Birth DATE,
    @Email VARCHAR(255),
    @Password VARCHAR(50),
    @Role NVARCHAR(10),
    @Weight DECIMAL(5,2),
    @Height DECIMAL(5,2),
    @Blood_Type CHAR(3),
    @Health_Status NVARCHAR(30)
)
AS
BEGIN
    INSERT INTO Users
    (
        First_Name, Last_Name, Gender, Date_Of_Birth, Email, Password, Role,
        Weight, Height, Blood_Type, Health_Status
    )
    VALUES
    (
        @First_Name, @Last_Name, @Gender, @Date_Of_Birth, @Email, @Password, @Role,
        @Weight, @Height, @Blood_Type, @Health_Status
    );
END

Go

-- Test SP

EXEC Register_User
    @First_Name = N'Ahmed',
    @Last_Name = N'Ali',
    @Gender = 'M',
    @Date_Of_Birth = '2000-05-10',
    @Email = 'test@gmail.com',
    @Password = '123456',
    @Role = N'User',
    @Weight = 70.5,
    @Height = 175.3,
    @Blood_Type = 'A+',
    @Health_Status = N'Good';


-- ------------------------------------------------------------------------ --

-- 1.2 : Login_User
-- التحقق من تسجيل الدخول

Go

CREATE PROCEDURE Login_User
(
    @Email VARCHAR(255),
    @Password VARCHAR(50)
)
AS
BEGIN
    SELECT Id_User, First_Name, Last_Name, Role
    FROM Users
    WHERE Email = @Email AND Password = @Password;
END

Go 

-- Test SP

-- True
EXEC Login_User
    @Email = 'test@gmail.com',
    @Password = '123456';
-- ------------------------------
-- False
EXEC Login_User
    @Email = 'test@gmail.com',
    @Password = '12345600'; -- 00

-- ------------------------------------------------------------------------ --

-- 1.3 : Update_User_Profile
-- تحديث بيانات المستخدم

Go

CREATE PROCEDURE Update_User_Profile
(
    @Id_User INT,
    @First_Name NVARCHAR(15),
    @Last_Name NVARCHAR(15),
    @Gender CHAR(1),
    @Date_Of_Birth DATE,
    @Weight DECIMAL(5,2),
    @Height DECIMAL(5,2),
    @Blood_Type CHAR(3),
    @Health_Status NVARCHAR(30)
)
AS
BEGIN
    UPDATE Users
    SET 
        First_Name = @First_Name,
        Last_Name = @Last_Name,
        Gender = @Gender,
        Date_Of_Birth = @Date_Of_Birth,
        Weight = @Weight,
        Height = @Height,
        Blood_Type = @Blood_Type,
        Health_Status = @Health_Status
    WHERE Id_User = @Id_User;
END

Go

-- Test SP

EXEC Update_User_Profile
    @Id_User = 9,
    @First_Name = N'Mohamed',
    @Last_Name = N'Salah',
    @Gender = 'M',
    @Date_Of_Birth = '1999-03-22',
    @Weight = 75.2,
    @Height = 178.0,
    @Blood_Type = 'O+',
    @Health_Status = N'Excellent';


-- ------------------------------------------------------------------------ --

-- 1.4 : Add_User_Address
-- إضافة عنوان جديد

Go

CREATE PROCEDURE Add_User_Address
(
    @Id_User INT,
    @Address NVARCHAR(255)
)
AS
BEGIN
    INSERT INTO Users_Addresses (Id_User, Address)
    VALUES (@Id_User, @Address);
END

Go

-- Test SP

EXEC Add_User_Address
    @Id_User = 9,
    @Address = N'شارع التحرير - القاهرة';


-- ------------------------------------------------------------------------ --

-- 1.5 : Add_User_Phone
-- إضافة هاتف جديد

Go

CREATE PROCEDURE Add_User_Phone
(
    @Id_User INT,
    @Phone VARCHAR(11)
)
AS
BEGIN
    INSERT INTO Users_Phones (Id_User, Phone)
    VALUES (@Id_User, @Phone);
END

Go

-- Test SP

EXEC Add_User_Phone
    @Id_User = 9,
    @Phone = '01012345678';


-- ------------------------------------------------------------------------ --

-- 1.6 : Add_User_Allergy
-- إضافة حساسية

Go 

CREATE PROCEDURE Add_User_Allergy
(
    @Id_User INT,
    @Allergy NVARCHAR(255)
)
AS
BEGIN
    INSERT INTO Users_Allergies (Id_User, Allergies)
    VALUES (@Id_User, @Allergy);
END

Go

-- Test SP

EXEC Add_User_Allergy
    @Id_User = 9,
    @Allergy = N'حساسية من البنسلين';


-- ------------------------------------------------------------------------ --

-- 1.7 : Add_User_Chronic_Disease
-- إضافة مرض مزمن

Go

CREATE PROCEDURE Add_User_Chronic_Disease
(
    @Id_User INT,
    @Chronic_Disease_Name NVARCHAR(255),
    @Disease_Type NVARCHAR(255)
)
AS
BEGIN
    INSERT INTO Users_Chronic_Diseases (Id_User, Chronic_Disease_Name, Disease_Type)
    VALUES (@Id_User, @Chronic_Disease_Name, @Disease_Type);
END

Go

-- Test SP

EXEC Add_User_Chronic_Disease
    @Id_User = 9,
    @Chronic_Disease_Name = N'السكري',
    @Disease_Type = N'مزمن';


-- ======================================================================== --


-- 2 : Cart 
-------------

-- 2.1 : Add_To_Cart

-- لو الكارت مش موجود → ينشئ واحد
-- لو موجود → يضيف المنتج جوه Cart_Items

Go

CREATE PROCEDURE Add_To_Cart
 @Id_User INT,
 @Product_API_Name NVARCHAR(255),
 @Quantity INT,
 @Price DECIMAL(10,2)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Id_Cart INT;

    -- هل للمستخدم كارت موجود؟
    SELECT @Id_Cart = Id_Cart 
    FROM Cart 
    WHERE Id_User = @Id_User;

    -- لو مفيش → نعمل واحد
    IF @Id_Cart IS NULL
    BEGIN
        INSERT INTO Cart (Total_Products, Total_Price, Id_User)
        VALUES (0, 0, @Id_User);

        SET @Id_Cart = SCOPE_IDENTITY();
    END

    -- إضافة المنتج للكارت
    INSERT INTO Cart_Items (Quantity, Price, Product_API_Name, Id_Cart)
    VALUES (@Quantity, @Price, @Product_API_Name, @Id_Cart);

    -- تحديث بيانات الكارت
    UPDATE Cart
    SET 
        Total_Products = Total_Products + @Quantity,
        Total_Price = Total_Price + (@Quantity * @Price)
    WHERE Id_Cart = @Id_Cart;
END

Go

-- Test SP

-- إضافة أول منتج لمستخدم هيعمل كارت جديدة

EXEC Add_To_Cart 
    @Id_User = 9,
    @Product_API_Name = N'Panadol Extra',
    @Quantity = 2,
    @Price = 35.50;
-------------------------------------------

-- إضافة منتج ثاني لنفس الكارت

EXEC Add_To_Cart 
    @Id_User = 9,
    @Product_API_Name = N'Vitamin C 1000',
    @Quantity = 1,
    @Price = 55.00;

-------------------------------------------

-- إضافة نفس المنتج بكميات مختلفة (مسموح

EXEC Add_To_Cart 
    @Id_User = 9,
    @Product_API_Name = N'Doliprane 500',
    @Quantity = 3,
    @Price = 22.00;


-- ------------------------------------------------------------------------ --

-- 2.2 : Update_Cart_Item

-- تعديل كمية أو سعر منتج موجود

Go

CREATE PROCEDURE Update_Cart_Item
 @Id_Cart_Item INT,
 @New_Quantity INT,
 @New_Price DECIMAL(10,2)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Id_Cart INT, @Old_Qty INT, @Old_Price DECIMAL(10,2);

    SELECT 
        @Id_Cart = Id_Cart,
        @Old_Qty = Quantity,
        @Old_Price = Price
    FROM Cart_Items
    WHERE Id_Cart_Item = @Id_Cart_Item;

    -- تعديل المنتج
    UPDATE Cart_Items
    SET Quantity = @New_Quantity,
        Price = @New_Price
    WHERE Id_Cart_Item = @Id_Cart_Item;

    -- تعديل إجمالي الكارت
    UPDATE Cart
    SET 
        Total_Products = Total_Products - @Old_Qty + @New_Quantity,
        Total_Price = Total_Price - (@Old_Qty * @Old_Price) + (@New_Quantity * @New_Price)
    WHERE Id_Cart = @Id_Cart;
END

Go

-- Test SP

-- تعديل كمية المنتج وسعره

EXEC Update_Cart_Item
    @Id_Cart_Item = 5,
    @New_Quantity = 5,
    @New_Price = 30.00;

-------------------------------------------

-- تقليل الكمية

EXEC Update_Cart_Item
    @Id_Cart_Item = 5,
    @New_Quantity = 1,
    @New_Price = 55.00;

-- ------------------------------------------------------------------------ --

-- 2.3 : Remove_Cart_Item

-- حذف منتج من الكارت

Go 

CREATE PROCEDURE Remove_Cart_Item
 @Id_Cart_Item INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Id_Cart INT, @Qty INT, @Price DECIMAL(10,2);

    SELECT 
        @Id_Cart = Id_Cart,
        @Qty = Quantity,
        @Price = Price
    FROM Cart_Items
    WHERE Id_Cart_Item = @Id_Cart_Item;

    -- حذف المنتج
    DELETE FROM Cart_Items
    WHERE Id_Cart_Item = @Id_Cart_Item;

    -- تعديل حسابات الكارت
    UPDATE Cart
    SET 
        Total_Products = Total_Products - @Qty,
        Total_Price = Total_Price - (@Qty * @Price)
    WHERE Id_Cart = @Id_Cart;
END

Go

-- Test SP

-- حذف عنصر من الكارت

EXEC Remove_Cart_Item 
    @Id_Cart_Item = 5;

-------------------------------------------

-- تجربة حذف عنصر غير موجود
-- لازم ما يديش ايرور

EXEC Remove_Cart_Item 
    @Id_Cart_Item = 999;


-- ------------------------------------------------------------------------ --

-- 2.4 : Clear_Cart 

-- تفريغ الكارت بالكامل

Go

CREATE PROCEDURE Clear_Cart
 @Id_User INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Id_Cart INT;

    SELECT @Id_Cart = Id_Cart FROM Cart WHERE Id_User = @Id_User;

    IF @Id_Cart IS NOT NULL
    BEGIN
        DELETE FROM Cart_Items WHERE Id_Cart = @Id_Cart;

        UPDATE Cart
        SET Total_Products = 0,
            Total_Price = 0
        WHERE Id_Cart = @Id_Cart;
    END
END

Go

-- Test SP

-- تفريغ كارت المستخدم بالكامل

EXEC Clear_Cart 
    @Id_User = 9;

-------------------------------------------

-- التأكد إن الكارت اتفضّى

SELECT * FROM Cart_Items WHERE Id_Cart IN (SELECT Id_Cart FROM Cart WHERE Id_User = 9);


-- ------------------------------------------------------------------------ --

-- 2.5 : Get_Cart_By_User

-- عرض الكارت وكل العناصر اللي فيه

Go 

CREATE PROCEDURE Get_Cart_By_User
 @Id_User INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        C.Id_Cart,
        C.Total_Products,
        C.Total_Price,
        CI.Id_Cart_Item,
        CI.Product_API_Name,
        CI.Quantity,
        CI.Price
    FROM Cart C
    LEFT JOIN Cart_Items CI ON C.Id_Cart = CI.Id_Cart
    WHERE C.Id_User = @Id_User;
END

Go


-- Test SP

-- عرض الكارت بكل تفاصيله

EXEC Get_Cart_By_User 
    @Id_User = 3;


-- ======================================================================== --

-- 3. Favorite
---------------

-- 3.1 : Add_Favorite

-- يضيف منتج للمفضلة.
-- يمنع التكرار لنفس اليوزر.

Go

CREATE PROCEDURE Add_Favorite
    @Id_User INT,
    @Product_API_Name NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- لو موجود قبل كده ممنوع إضافة تاني
    IF EXISTS (
        SELECT 1 FROM Favorite
        WHERE Id_User = @Id_User AND Product_API_Name = @Product_API_Name
    )
    BEGIN
        RETURN;
    END

    INSERT INTO Favorite (Product_API_Name, Id_User)
    VALUES (@Product_API_Name, @Id_User);
END


Go

-- Test SP

-- يضيف سطر جديد في جدول المفضلة

EXEC Add_Favorite 
    @Id_User = 9,
    @Product_API_Name = N'Panadol Extra';

-------------------------------------------

-- المفروض يمنع التكرار
-- لا يتم إضافة صف جديد لا يظهر ايرور

EXEC Add_Favorite 
    @Id_User = 9,
    @Product_API_Name = N'Panadol Extra';


-- ------------------------------------------------------------------------ --

-- 3.2 : Remove_Favorite

-- يمسح عنصر من المفضلة.
-- لو مش موجود → يعمل نفسه مش شايف منغير ايرور

Go

CREATE PROCEDURE Remove_Favorite
    @Id_User INT,
    @Product_API_Name NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Favorite
    WHERE Id_User = @Id_User
      AND Product_API_Name = @Product_API_Name;
END

Go

-- Test SP

-- حذف منتج موجود

EXEC Remove_Favorite 
    @Id_User = 9,
    @Product_API_Name = N'Panadol Extra';

-------------------------------------------

-- لو المنتج مش موجود ميعملش ايرور

EXEC Remove_Favorite 
    @Id_User = 9,
    @Product_API_Name = N'Panadol Extra';


-- ------------------------------------------------------------------------ --

-- 3.3 : Get_User_Favorites

-- يرجّع كل المفضلة بتاعة يوزر معين.

Go

CREATE PROCEDURE Get_User_Favorites
    @Id_User INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id_Favorite, Product_API_Name, Id_User
    FROM Favorite
    WHERE Id_User = @Id_User;
END

Go


-- Test SP

-- عرض المفضلة

EXEC Get_User_Favorites 
    @Id_User = 2;


-- ======================================================================== --

-- 4. Orders 
------------

-- 4.1 : Create_Order_From_Cart

-- يقرأ بيانات الـكرت
-- يحسب السعر الاجمالي علي حسب الكرت ايتم
-- يضيف اوردر 
-- يرجّع رقم الأوردر الجديد

Go

CREATE PROCEDURE Create_Order_From_Cart
    @Id_User INT,
    @Id_Cart INT,
    @Id_Payment_Method INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Total_Amount DECIMAL(10,2);

    -- نحسب الإجمالي من Cart Items
    SELECT @Total_Amount = SUM(Price * Quantity)
    FROM Cart_Items
    WHERE Id_Cart = @Id_Cart;

    -- لو الكارت فاضي
    IF @Total_Amount IS NULL
    BEGIN
        SELECT 'Cart_Is_Empty' AS Status;
        RETURN;
    END

    -- إنشاء الأوردر
    INSERT INTO Orders (Total_Amount, Id_User, Id_Cart, Id_Payment_Method)
    VALUES (@Total_Amount, @Id_User, @Id_Cart, @Id_Payment_Method);

    -- نرجع رقم الأوردر الجديد
    SELECT SCOPE_IDENTITY() AS New_Order_ID;
END


-- Test SP

-- بيعمل اوردر جديد - فاتورة

EXEC Create_Order_From_Cart
    @Id_User = 2,
    @Id_Cart = 3,
    @Id_Payment_Method = 1;

-------------------------------------------

-- كارت فاضي (المفروض يرجّع 
-- (Cart_Is_Empty)

    EXEC Create_Order_From_Cart
    @Id_User = 2,
    @Id_Cart = 10,  -- كارت فاضي
    @Id_Payment_Method = 2;


-- ------------------------------------------------------------------------ --

-- 4.2 : Get_Order_Details

-- بيانات الأوردر
-- بيانات الكارت
-- و الـ ايتم اللي جواه

Go

CREATE PROCEDURE Get_Order_Details
    @Id_Order INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        O.Id_Order,
        O.Create_At_Order,
        O.Total_Amount,
        O.Id_User,
        O.Id_Cart,
        O.Id_Payment_Method
    FROM Orders O
    WHERE O.Id_Order = @Id_Order;

    -- رجّع عناصر الكارت المرتبطة بالأوردر
    SELECT 
        CI.Id_Cart_Item,
        CI.Product_API_Name,
        CI.Quantity,
        CI.Price
    FROM Cart_Items CI
    JOIN Orders O ON O.Id_Cart = CI.Id_Cart
    WHERE O.Id_Order = @Id_Order;
END

Go

-- Test SP

-- تجيب تفاصيل الأوردر + تفاصيل عناصر الكارت

EXEC Get_Order_Details @Id_Order = 5;

-- جزء تفاصيل الطلب:
-- جزء عناصر الكارت:

-- ======================================================================== --

-- 5. Medicine_Requests
------------------------

-- 5.1 : Create_Request

-- المستخدم يطلب دواء → يتحفظ طلب في جدول Medicine_Requests

-- ده المسؤول عن إضافة طلب دواء جديد عمله المستخدم.

Go

CREATE PROCEDURE Create_Request
    @Id_User INT,
    @Medicine_Name NVARCHAR(50),
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Insert with default Create_At and default Order_Status = 'P' (Pending)
    INSERT INTO Medicine_Requests (Medicine_Name, Quantity, Order_Status, Id_User)
    VALUES (@Medicine_Name, @Quantity, 'P', @Id_User);

    SELECT SCOPE_IDENTITY() AS New_Request_Id;
END;

Go

-- Test SP

-- إنشاء طلب جديد:

EXEC Create_Request @Id_User = 9, @Medicine_Name = N'Panadol Extra', @Quantity = 2;


-- ------------------------------------------------------------------------ --

-- يعني وجوده مربوط بوجود طلب، وبيعني إن الصيدلي وافق على توفير الدواء. 

Go

CREATE TRIGGER TR_Update_Request_Status_On_Availability
ON Medicine_Availability
AFTER INSERT
AS
BEGIN
    UPDATE Medicine_Requests
    SET Order_Status = 'A'
    WHERE Id_Request IN (SELECT Id_Request FROM INSERTED);
END

Go

-- A = تم الموافقة
-- وتتحدد تلقائيًا لما يتضاف Availability


-- ------------------------------------------------------------------------ --


-- 5.2 : Get_User_Requests

-- ده مسؤول عن عرض كل الطلبات اللي عملها مستخدم معين.

Go


CREATE PROCEDURE Get_User_Requests
    @Id_User INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        Id_Request,
        Medicine_Name,
        Quantity,
        Create_At,
        Order_Status
    FROM Medicine_Requests
    WHERE Id_User = @Id_User
    ORDER BY Create_At DESC;
END;

Go

-- Test SP

-- جلب طلبات مستخدم:

EXEC Get_User_Requests @Id_User = 9;

-- ======================================================================== --

-- 6. Notifications
---------------------

-- 6.1 : Create_Notification

-- يستخدم لإضافة إشعار جديد للمستخدم — غالبًا لما حالة الطلب تتغير.
-- لتحديث حالة الطلب لما صيدلي يرد

Go

CREATE TRIGGER TR_Request_Status_Auto_Update
ON Medicine_Availability
AFTER INSERT
AS
BEGIN
    -- تحويل حالة الطلب لأول رد من أي صيدلية
    UPDATE Medicine_Requests
    SET Order_Status = 'A'
    WHERE Id_Request IN (SELECT Id_Request FROM INSERTED)
      AND Order_Status <> 'A';
END


Go

-------------------------------------------------

-- لإنشاء إشعار لكل رد من كل صيدلي

Go

CREATE TRIGGER TR_Create_Notification_On_Availability
ON Medicine_Availability
AFTER INSERT
AS
BEGIN
    -- كل Availability جديدة = إشعار جديد للمستخدم
    INSERT INTO Notifications (Id_User, Id_Request)
    SELECT
        R.Id_User,      -- المستخدم صاحب الطلب
        I.Id_Request    -- الطلب اللي الصيدلي رد عليه
    FROM INSERTED I
    INNER JOIN Medicine_Requests R
        ON R.Id_Request = I.Id_Request;
END


Go

-- ------------------------------------------------------------------------ --

-- 6.2 : Get_User_Notifications

-- يرجع كل الإشعارات الخاصة بالمستخدم.

GO

CREATE PROCEDURE Get_User_Notifications
    @Id_User INT
AS
BEGIN
    SELECT 
        N.Id_Notification,
        N.Create_At,
        N.Id_Request,
        MR.Medicine_Name,
        MR.Order_Status
    FROM Notifications N
    INNER JOIN Medicine_Requests MR
        ON N.Id_Request = MR.Id_Request
    WHERE N.Id_User = @Id_User
    ORDER BY N.Create_At DESC;
END

Go

-- Test SP

-- عرض جميع اشعارات المستخدم

EXEC Get_User_Notifications @Id_User = 9;


-- ======================================================================== --






-- الأدمن (Block / Unblock User)

Go

CREATE PROCEDURE Admin_Block_User
    @Id_User INT
AS
BEGIN
    UPDATE Users
    SET Block_Status = 'B'
    WHERE Id_User = @Id_User;
END


Go

-- ------------------------------------------------------------------------ --


-- منع اليوزر البلوك من تسجيل الدخول

-- لو اليوزر Blocked → نمنع الدخول.

Go

ALTER PROCEDURE Login_User
    @Email VARCHAR(255),
    @Password VARCHAR(50)
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM Users 
        WHERE Email = @Email AND Password = @Password AND Block_Status = 'B'
    )
    BEGIN
        SELECT 'User is blocked' AS Message;
        RETURN;
    END

    SELECT Id_User, First_Name, Last_Name, Role
    FROM Users
    WHERE Email = @Email AND Password = @Password;
END


Go






