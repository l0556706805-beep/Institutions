using System;
using System.Text;
using EducationOrdersAPI.Data;
using EducationOrdersAPI.Helpers;
using EducationOrdersAPI.Repository;
using EducationOrdersAPI.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// =====================
// Database (PostgreSQL - Supabase)
// =====================
builder.Services.AddDbContext<InstitutionsContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// =====================
// Email Settings
// =====================
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddTransient<IEmailService, EmailService>();

// =====================
// JWT Settings
// =====================
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt"));

var jwt = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
          ?? throw new Exception("JWT settings missing");

// =====================
// Services & Repositories
// =====================
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// =====================
// Controllers & Swagger
// =====================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =====================
// JWT Authentication
// =====================
var key = Encoding.UTF8.GetBytes(jwt.Key);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // פיתוח מקומי
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,

            ValidateAudience = true,
            ValidAudience = jwt.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// =====================
// Authorization
// =====================
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin",
        policy => policy.RequireClaim("role", "Admin"));

    options.AddPolicy("Institution",
        policy => policy.RequireClaim("role", "Institution"));
});

// =====================
// CORS
// =====================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;

                // Local dev
                if (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
                    && uri.Port == 3000)
                    return true;

                // Cloudflare
                if (uri.Host.EndsWith(".workers.dev", StringComparison.OrdinalIgnoreCase))
                    return true;

                if (uri.Host.EndsWith(".pages.dev", StringComparison.OrdinalIgnoreCase))
                    return true;

                return false;
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// =====================
// Middleware
// =====================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // =====================
    // DB Migration & Seed (DEV ONLY)
    // =====================
    using var scope = app.Services.CreateScope();
    var ctx = scope.ServiceProvider.GetRequiredService<InstitutionsContext>();

    ctx.Database.Migrate();
    SeedData.Initialize(ctx);
}

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
