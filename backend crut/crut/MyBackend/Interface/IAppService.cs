using MyBackend.DTO;

namespace MyBackend.INTERFACE;

public interface IAppService
{
    // LOGIN
bool Login(LoginRequest login, string ipAddress);
List<string> GetActiveUsers();

bool Logout(string username);
    // SETTINGS
  
    bool UpdateSettings(SettingsRequest settings);
  bool ChangePassword(ChangePasswordRequest request);
    // REGISTER
    bool RegisterUser(RegisterRequest request);

    // USERS
    List<UserDisplayDto> GetUsers();

    // STUDENTS
    List<StudentDto> GetStudents(string username);

    StudentDto AddStudent(StudentDto student);

    StudentDto? UpdateStudent(int id, StudentDto student, string username);

    bool DeleteStudent(int id, string username);

    bool DeleteAllStudents(string username);
    
}