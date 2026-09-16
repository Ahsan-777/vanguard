using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

using MyBackend.DAL;
using MyBackend.INTERFACE;



var builder = WebApplication.CreateBuilder(args);

// ==================== CORS ====================

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


// ==================== authentication ====================

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is missing.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("JWT Issuer is missing.");

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("JWT Audience is missing.");

    builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey)
                ),

            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateLifetime = true,

            ClockSkew = TimeSpan.Zero
        };
    });


// ==================== AUTHORIZATION ====================

builder.Services.AddAuthorization();

// ==================== SERVICES ====================

builder.Services.AddControllers();

// IAppService -> AppDAL
builder.Services.AddSingleton<IAppService, AppDAL>();

// ==================== BUILD APP ====================

var app = builder.Build();



using (var scope = app.Services.CreateScope())
{
    var dal = scope.ServiceProvider.GetRequiredService<IAppService>();
}
// ==================== MIDDLEWARE ====================

app.UseCors("AllowFrontend");
// IMPORTANT:
// Authentication MUST come before Authorization.

app.UseAuthentication();

app.UseAuthorization();
// ==================== CONTROLLERS ====================

app.MapControllers();

// ==================== RUN ====================

app.Run();
