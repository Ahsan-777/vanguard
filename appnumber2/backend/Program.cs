using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using System.Text;
using System.Text.Json.Serialization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Utils;
using backend.DAL;

// Ensure default JWT claim type mapping doesn't override custom claim names
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// =====================================
// ADD CONTROLLERS & PREVENT JSON CYCLES
// =====================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// =====================================
// EF CORE MYSQL DB CONTEXT
// =====================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString, 
        ServerVersion.AutoDetect(connectionString)
    )
);

// =====================================
// SERVICES & DAL INJECTION
// =====================================
builder.Services.AddScoped<IPasswordHasher<string>, PasswordHasher<string>>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthDAL>();
builder.Services.AddScoped<TicketDAL>();
builder.Services.AddScoped<TicketMessageDAL>();
builder.Services.AddScoped<TicketStatsDAL>();

// =====================================
// CORS CONFIGURATION
// =====================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// =====================================
// JWT AUTHENTICATION
// =====================================
var jwtKey = builder.Configuration["Jwt:Key"] ?? "YourSuperSecretKeyHereWhichIsAtLeast32BytesLong!";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "http://localhost:5091",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "http://localhost:5173",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        
        // Match Claims correctly across controllers
        NameClaimType = ClaimTypes.Name,
        RoleClaimType = ClaimTypes.Role
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// =====================================
// MIDDLEWARE PIPELINE
// =====================================
app.UseRouting();

// 2. CORS must execute after UseRouting and before Auth
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles(); // Enables serving files from wwwroot
app.MapControllers();

app.Run();