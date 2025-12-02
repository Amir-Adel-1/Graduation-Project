

-- Views
---------

-- 1.Users 
-----------


-- 1.1 : View_User_Profile

-- »Ì⁄—÷ œ« « «··Ì ›Ì „·› «·‘Œ’Ì

GO

CREATE VIEW User_Full_Info_View AS
SELECT
    U.Id_User,
    U.First_Name,
    U.Last_Name,
    U.Gender,
    U.Date_Of_Birth,
    U.Email,
    U.Role,
    U.Weight,
    U.Height,
    U.Blood_Type,
    U.Health_Status,
    U.Create_At,
    U.Block_Status,

    -- Address
    UA.Address,

    -- Phone
    UP.Phone,

    -- Chronic Diseases
    CD.Chronic_Disease_Name,
    CD.Disease_Type,

    -- Allergies
    AL.Allergies

FROM Users U
LEFT JOIN Users_Addresses UA ON U.Id_User = UA.Id_User
LEFT JOIN Users_Phones UP ON U.Id_User = UP.Id_User
LEFT JOIN Users_Chronic_Diseases CD ON U.Id_User = CD.Id_User
LEFT JOIN Users_Allergies AL ON U.Id_User = AL.Id_User;


GO


SELECT * FROM User_Full_Info_View WHERE Id_User = 9;


-- ------------------------------------------------------------------------ --














