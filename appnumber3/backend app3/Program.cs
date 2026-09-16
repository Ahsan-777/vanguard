// using System.Text;
// using backend_app3.Data;
// using backend_app3.Models;
// using backend_app3.Repositories;
// using Microsoft.AspNetCore.Authentication.JwtBearer;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.IdentityModel.Tokens;
// using QuestPDF.Infrastructure;

// QuestPDF.Settings.License = LicenseType.Community;

// var builder = WebApplication.CreateBuilder(args);

// // Configure Kestrel to bind to all local network interfaces (0.0.0.0:5038)
// builder.WebHost.ConfigureKestrel(serverOptions =>
// {
//     serverOptions.ListenAnyIP(5038);
// });

// // 1. Add Database Context (Resolved CS8604 warning using null check)
// var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
//     ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseMySQL(connectionString));

// // 2. Register Password Hasher Service
// builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// // 3. Register Data Access Layer (Repositories)
// builder.Services.AddScoped<IUserRepository, UserRepository>();
// builder.Services.AddScoped<ICarRepository, CarRepository>();
// builder.Services.AddScoped<ISparePartRepository, SparePartRepository>();

// // 4. Configure JWT Authentication
// var jwtSettings = builder.Configuration.GetSection("Jwt");
// var secretKey = jwtSettings["Key"] ?? "YourSuperSecretKeyHere1234567890!";

// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
// })
// .AddJwtBearer(options =>
// {
//     options.TokenValidationParameters = new TokenValidationParameters
//     {
//         ValidateIssuer = true,
//         ValidateAudience = true,
//         ValidateLifetime = true,
//         ValidateIssuerSigningKey = true,
//         ValidIssuer = jwtSettings["Issuer"] ?? "http://localhost:5038",
//         ValidAudience = jwtSettings["Audience"] ?? "http://localhost:5173",
//         IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
//     };
// });

// // 5. Add CORS Policy (Updated for Mobile + Web)
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowWebAndMobile", policy =>
//     {
//         policy.SetIsOriginAllowed(origin => true) // Allows localhost, local network IPs (e.g. 192.168.x.x), and Expo dev tools
//               .AllowAnyHeader()
//               .AllowAnyMethod()
//               .AllowCredentials();
//     });
// });

// builder.Services.AddControllers();
// builder.Services.AddEndpointsApiExplorer();

// var app = builder.Build();

// // Middleware Pipeline Order
// app.UseStaticFiles();

// // Apply the updated CORS policy
// app.UseCors("AllowWebAndMobile");

// app.UseAuthentication();
// app.UseAuthorization();

// app.MapControllers();

// app.Run();
using System.Text;
using backend_app3.Data;
using backend_app3.Models;
using backend_app3.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to bind to all local network interfaces (0.0.0.0:5038)
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5038);
});

// 1. Add Database Context (Resolved CS8604 warning using null check)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(connectionString));

// 2. Register Password Hasher Service
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// 3. Register Data Access Layer (Repositories)
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICarRepository, CarRepository>();
builder.Services.AddScoped<ISparePartRepository, SparePartRepository>();

// 4. Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"] ?? "YourSuperSecretKeyHere1234567890!";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "http://localhost:5038",
        ValidAudience = jwtSettings["Audience"] ?? "http://localhost:5173",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// 5. Add CORS Policy (Updated for Mobile + Web)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWebAndMobile", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Allows localhost, local network IPs, and Expo dev tools
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // <-- Added Swagger Generator

var app = builder.Build();

// Middleware Pipeline Order
app.UseStaticFiles();

// Enable Swagger UI in Production/All environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Vanguard API V1");
    c.RoutePrefix = "swagger"; // Makes swagger accessible at /swagger
});

// Apply the updated CORS policy
app.UseCors("AllowWebAndMobile");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();