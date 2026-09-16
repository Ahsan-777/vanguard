using Microsoft.AspNetCore.Identity;
using MyBackend.DTO;
using MyBackend.INTERFACE;
using MyBackend.UTILS;
using MySql.Data.MySqlClient;

namespace MyBackend.DAL;

public class AppDAL : IAppService
{
    // =========================
    // MYSQL CONNECTION
    // =========================

    private readonly string connectionString =
        "Server=localhost;Port=3306;Database=mybackend;User=root;Password=Pubg1234;";

    private readonly PasswordHasher<string> passwordHasher;
    private readonly List<UserDto> users = new List<UserDto>();

    private string currentUsername;
    private string currentDepartment;
    private string storedPasswordHash;

    private readonly List<StudentDto> students = new()
    {
        new StudentDto { Id = 1, Name = "Ahsan", Age = 20 },
        new StudentDto { Id = 2, Name = "Ali", Age = 21 },
        new StudentDto { Id = 3, Name = "Talha", Age = 24 }
    };

    private int nextId = 4;


    // =========================
    // CONSTRUCTOR
    // =========================

    public AppDAL()
    {
        passwordHasher = new PasswordHasher<string>();

        currentUsername = PASSCODE.Username;
        currentDepartment = PASSCODE.Department;

        storedPasswordHash = passwordHasher.HashPassword(
            currentUsername,
            PASSCODE.Password
        );

        TestMySqlConnection();
    }


    // =========================
    // TEST MYSQL CONNECTION
    // =========================

    public void TestMySqlConnection()
    {
        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        Console.WriteLine("MySQL CONNECTED SUCCESSFULLY!");
    }


    // =========================
    // REGISTER USER
    // =========================

    public bool RegisterUser(RegisterRequest request)
    {
        if (request == null)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Department))
        {
            return false;
        }

        string realPassword;

        try
        {
            realPassword =
                AppUtils.DecodeBase64(request.Password);
        }
        catch
        {
            return false;
        }

        string passwordHash =
            passwordHasher.HashPassword(
                request.Username,
                realPassword
            );

        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string checkQuery =
            "SELECT COUNT(*) FROM users WHERE username = @username";

        using var checkCommand =
            new MySqlCommand(checkQuery, connection);

        checkCommand.Parameters.AddWithValue(
            "@username",
            request.Username
        );

        long count = Convert.ToInt64(
            checkCommand.ExecuteScalar()
        );

        if (count > 0)
        {
            return false;
        }

        string insertQuery = @"
            INSERT INTO users
            (username, password, department, is_active)
            VALUES
            (@username, @password, @department, FALSE)";

        using var insertCommand =
            new MySqlCommand(insertQuery, connection);

        insertCommand.Parameters.AddWithValue(
            "@username",
            request.Username
        );

        insertCommand.Parameters.AddWithValue(
            "@password",
            passwordHash
        );

        insertCommand.Parameters.AddWithValue(
            "@department",
            request.Department
        );

        int rows =
            insertCommand.ExecuteNonQuery();

        return rows > 0;
    }


    // =========================
    // LOGIN
    // =========================

    public bool Login(LoginRequest login, string ipAddress)
    {
        if (login == null ||
            string.IsNullOrWhiteSpace(login.Username) ||
            string.IsNullOrWhiteSpace(login.Password))
        {
            return false;
        }

        string decryptedPassword;

        try
        {
            decryptedPassword =
                AppUtils.DecodeBase64(login.Password);
        }
        catch
        {
            return false;
        }


        // =========================
        // DEFAULT USER (ADMIN)
        // =========================

        if (string.Equals(
            login.Username,
            currentUsername,
            StringComparison.OrdinalIgnoreCase))
        {
            var passwordResult =
                passwordHasher.VerifyHashedPassword(
                    currentUsername,
                    storedPasswordHash,
                    decryptedPassword
                );

            bool departmentValid =
                string.Equals(
                    login.department,
                    currentDepartment,
                    StringComparison.OrdinalIgnoreCase
                );

            bool loginSuccess =
                departmentValid &&
                passwordResult != PasswordVerificationResult.Failed;

            if (loginSuccess)
            {
                AddLoginSession(
                    currentUsername,
                    ipAddress
                );
            }

            return loginSuccess;
        }


        // =========================
        // NEW USERS FROM MYSQL
        // =========================

        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string query = @"
            SELECT username, password, department
            FROM users
            WHERE username = @username";

        using var command =
            new MySqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@username",
            login.Username
        );

        using var reader =
            command.ExecuteReader();

        if (!reader.Read())
        {
            return false;
        }

        string username =
            reader["username"].ToString()!;

        string passwordHash =
            reader["password"].ToString()!;

        string department =
            reader["department"].ToString()!;


        bool departmentValidForNewUser =
            string.Equals(
                login.department,
                department,
                StringComparison.OrdinalIgnoreCase
            );

        if (!departmentValidForNewUser)
        {
            return false;
        }


        var passwordResultForNewUser =
            passwordHasher.VerifyHashedPassword(
                username,
                passwordHash,
                decryptedPassword
            );

        bool loginSuccessForNewUser =
            passwordResultForNewUser !=
            PasswordVerificationResult.Failed;

        if (loginSuccessForNewUser)
        {
            AddLoginSession(
                username,
                ipAddress
            );
        }

        return loginSuccessForNewUser;
    }


    // =========================
    // SETTINGS
    // =========================

    public bool UpdateSettings(SettingsRequest settings)
    {
        if (string.IsNullOrWhiteSpace(settings.Username) ||
            string.IsNullOrWhiteSpace(settings.Password) ||
            string.IsNullOrWhiteSpace(settings.Department))
        {
            return false;
        }

        currentUsername = settings.Username;
        currentDepartment = settings.Department;

        storedPasswordHash =
            passwordHasher.HashPassword(
                currentUsername,
                settings.Password
            );

        return true;
    }

    // =========================
    // CHANGE PASSWORD
    // =========================

    public bool ChangePassword(ChangePasswordRequest request)
    {
        if (request == null ||
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.OldPassword) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return false;
        }

        string oldPassword;

        try
        {
            oldPassword =
                AppUtils.DecodeBase64(request.OldPassword);
        }
        catch
        {
            return false;
        }

        string newPassword;

        try
        {
            newPassword =
                AppUtils.DecodeBase64(request.NewPassword);
        }
        catch
        {
            return false;
        }

        if (string.Equals(
            request.Username,
            currentUsername,
            StringComparison.OrdinalIgnoreCase))
        {
            var passwordResult =
                passwordHasher.VerifyHashedPassword(
                    currentUsername,
                    storedPasswordHash,
                    oldPassword
                );

            if (passwordResult ==
                PasswordVerificationResult.Failed)
            {
                return false;
            }

            storedPasswordHash =
                passwordHasher.HashPassword(
                    currentUsername,
                    newPassword
                );

            return true;
        }

        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string query = @"
            SELECT username, password
            FROM users
            WHERE username = @username";

        using var command =
            new MySqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@username",
            request.Username
        );

        string username;
        string passwordHash;

        using (var reader = command.ExecuteReader())
        {
            if (!reader.Read())
            {
                return false;
            }

            username =
                reader["username"].ToString() ?? "";

            passwordHash =
                reader["password"].ToString() ?? "";
        }

        var oldPasswordResult =
            passwordHasher.VerifyHashedPassword(
                username,
                passwordHash,
                oldPassword
            );

        if (oldPasswordResult ==
            PasswordVerificationResult.Failed)
        {
            return false;
        }

        string newPasswordHash =
            passwordHasher.HashPassword(
                username,
                newPassword
            );

        string updateQuery = @"
            UPDATE users
            SET password = @password
            WHERE username = @username";

        using var updateCommand =
            new MySqlCommand(
                updateQuery,
                connection
            );

        updateCommand.Parameters.AddWithValue(
            "@password",
            newPasswordHash
        );

        updateCommand.Parameters.AddWithValue(
            "@username",
            username
        );

        int rows =
            updateCommand.ExecuteNonQuery();

        return rows > 0;
    }


    // =========================
    // GET STUDENTS
    // =========================

    public List<StudentDto> GetStudents(string username)
    {
        List<StudentDto> result =
            new List<StudentDto>();

        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string query;

        bool isDefaultUser =
            string.Equals(
                username,
                PASSCODE.Username,
                StringComparison.OrdinalIgnoreCase);

        if (isDefaultUser)
        {
            query = @"
                SELECT id, name, age, username
                FROM students";
        }
        else
        {
            query = @"
                SELECT id, name, age, username
                FROM students
                WHERE username = @username";
        }

        using var command =
            new MySqlCommand(query, connection);

        if (!isDefaultUser)
        {
            command.Parameters.AddWithValue(
                "@username",
                username
            );
        }

        using var reader =
            command.ExecuteReader();

        while (reader.Read())
        {
            result.Add(new StudentDto
            {
                Id = Convert.ToInt32(reader["id"]),
                Name = reader["name"].ToString() ?? "",
                Age = Convert.ToInt32(reader["age"]),
                Username = reader["username"].ToString() ?? ""
            });
        }

        return result;
    }


    // =========================
    // ADD STUDENT
    // =========================

    public StudentDto AddStudent(StudentDto student)
    {
        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string insertQuery = @"
            INSERT INTO students
            (name, age, username)
            VALUES
            (@name, @age, @username)";

        using var command =
            new MySqlCommand(insertQuery, connection);

        command.Parameters.AddWithValue(
            "@name",
            student.Name
        );

        command.Parameters.AddWithValue(
            "@age",
            student.Age
        );

        command.Parameters.AddWithValue(
            "@username",
            student.Username
        );

        command.ExecuteNonQuery();

        student.Id =
            (int)command.LastInsertedId;

        return student;
    }


    // =========================
    // UPDATE STUDENT
    // =========================

    public StudentDto? UpdateStudent(
        int id,
        StudentDto updatedStudent,
        string username)
    {
        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        bool isDefaultUser =
            string.Equals(
                username,
                PASSCODE.Username,
                StringComparison.OrdinalIgnoreCase);

        string query;

        if (isDefaultUser)
        {
            query = @"
                UPDATE students
                SET name = @name, age = @age
                WHERE id = @id";
        }
        else
        {
            query = @"
                UPDATE students
                SET name = @name, age = @age
                WHERE id = @id
                AND username = @username";
        }

        using var command =
            new MySqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@name",
            updatedStudent.Name
        );

        command.Parameters.AddWithValue(
            "@age",
            updatedStudent.Age
        );

        command.Parameters.AddWithValue(
            "@id",
            id
        );

        if (!isDefaultUser)
        {
            command.Parameters.AddWithValue(
                "@username",
                username
            );
        }

        int rows =
            command.ExecuteNonQuery();

        if (rows == 0)
        {
            return null;
        }

        return new StudentDto
        {
            Id = id,
            Name = updatedStudent.Name,
            Age = updatedStudent.Age,
            Username = username
        };
    }


    // =========================
    // DELETE STUDENT
    // =========================

    public bool DeleteStudent(
        int id,
        string username)
    {
        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        bool isDefaultUser =
            string.Equals(
                username,
                PASSCODE.Username,
                StringComparison.OrdinalIgnoreCase);

        string query;

        if (isDefaultUser)
        {
            query =
                "DELETE FROM students WHERE id = @id";
        }
        else
        {
            query = @"
                DELETE FROM students
                WHERE id = @id
                AND username = @username";
        }

        using var command =
            new MySqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@id",
            id
        );

        if (!isDefaultUser)
        {
            command.Parameters.AddWithValue(
                "@username",
                username
            );
        }

        int rows =
            command.ExecuteNonQuery();

        return rows > 0;
    }


    // =========================
    // DELETE ALL STUDENTS
    // =========================

    public bool DeleteAllStudents(string username)
    {
        bool isDefaultUser =
            string.Equals(
                username,
                PASSCODE.Username,
                StringComparison.OrdinalIgnoreCase);

        if (!isDefaultUser)
        {
            return false;
        }

        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string query =
            "DELETE FROM students";

        using var command =
            new MySqlCommand(query, connection);

        command.ExecuteNonQuery();

        return true;
    }


    // =========================
    // GET USERS FROM MYSQL
    // =========================

    public List<UserDisplayDto> GetUsers()
    {
        List<UserDisplayDto> users =
            new List<UserDisplayDto>();

        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        string query = @"
            SELECT username, department
            FROM users";

        using var command =
            new MySqlCommand(query, connection);

        using var reader =
            command.ExecuteReader();

        while (reader.Read())
        {
            users.Add(new UserDisplayDto
            {
                Username =
                    reader["username"].ToString() ?? "",

                Department =
                    reader["department"].ToString() ?? ""
            });
        }

        return users;
    }


    // =========================
    // LOGIN SESSIONS & ADMIN
    // =========================

    private void AddLoginSession(
        string username,
        string ipAddress)
    {
        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();


        // 1. UPDATE USERS TABLE (ONLY FOR REGISTERED USERS)
        string userQuery = @"
            UPDATE users
            SET is_active = TRUE
            WHERE username = @username";

        using var userCommand =
            new MySqlCommand(
                userQuery,
                connection
            );

        userCommand.Parameters.AddWithValue(
            "@username",
            username
        );

        userCommand.ExecuteNonQuery();


        // 2. CLOSE PREVIOUS ACTIVE SESSIONS FOR THIS USER ONLY
        string updateQuery = @"
            UPDATE login_sessions
            SET is_active = FALSE,
                logout_time = NOW()
            WHERE username = @username
            AND is_active = TRUE";

        using var updateCommand =
            new MySqlCommand(
                updateQuery,
                connection
            );

        updateCommand.Parameters.AddWithValue(
            "@username",
            username
        );

        updateCommand.ExecuteNonQuery();


        // 3. CREATE NEW ACTIVE SESSION
        string insertQuery = @"
            INSERT INTO login_sessions
            (username, login_time, is_active, ip_address)
            VALUES
            (@username, NOW(), TRUE, @ipAddress)";

        using var insertCommand =
            new MySqlCommand(
                insertQuery,
                connection
            );

        insertCommand.Parameters.AddWithValue(
            "@username",
            username
        );

        insertCommand.Parameters.AddWithValue(
            "@ipAddress",
            ipAddress
        );

        insertCommand.ExecuteNonQuery();

        Console.WriteLine(
            "User is now ACTIVE: " +
            username +
            " | IP: " +
            ipAddress
        );
    }


    // =========================
    // GET ACTIVE USERS
    // =========================

    public List<string> GetActiveUsers()
    {
        List<string> activeUsers =
            new List<string>();

        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();

        // Distinct list of users having an active session
        string query = @"
            SELECT DISTINCT username
            FROM login_sessions
            WHERE is_active = TRUE";

        using var command =
            new MySqlCommand(
                query,
                connection
            );

        using var reader =
            command.ExecuteReader();

        while (reader.Read())
        {
            activeUsers.Add(
                reader["username"].ToString() ?? ""
            );
        }

        return activeUsers;
    }


    // =========================
    // LOGOUT
    // =========================

    public bool Logout(string username)
    {
        using var connection =
            new MySqlConnection(connectionString);

        connection.Open();


        // 1. SET USER INACTIVE IN USERS TABLE
        string userQuery = @"
            UPDATE users
            SET is_active = FALSE
            WHERE username = @username";

        using var userCommand =
            new MySqlCommand(
                userQuery,
                connection
            );

        userCommand.Parameters.AddWithValue(
            "@username",
            username
        );

        userCommand.ExecuteNonQuery();


        // 2. CLOSE LOGIN SESSIONS
        string query = @"
            UPDATE login_sessions
            SET is_active = FALSE,
                logout_time = NOW()
            WHERE username = @username
            AND is_active = TRUE";

        using var command =
            new MySqlCommand(
                query,
                connection
            );

        command.Parameters.AddWithValue(
            "@username",
            username
        );

        int rows =
            command.ExecuteNonQuery();

        return rows > 0;
    }
}