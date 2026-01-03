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
// Email Settings
// =====================
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddTransient<IEmailService, EmailService>();

// =====================
// JWT Settings
// =====================
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
var jwt = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();

// =====================
// Database (LOCAL SQL)
// =====================
builder.Services.AddDbContext<InstitutionsContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

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

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // מאפשר פיתוח מקומי ב־HTTP
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwt.Issuer,

        ValidateAudience = true,
        ValidAudience = jwt.Audience,

        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),

        ValidateLifetime = true
    };
});

// =====================
// Authorization
// =====================
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireClaim("role", "Admin"));
    options.AddPolicy("Institution", policy => policy.RequireClaim("role", "Institution"));
});

// =====================
// CORS
// =====================
// מאפשר גם פיתוח מקומי וגם frontend בפריסה
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",          // local dev
                "https://localhost:3000",         // local HTTPS
                "https://b82a5448.institutions-czw.pages.dev" // deployed frontend
            )
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
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// =====================
// DB Migration & Seed
// =====================
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<InstitutionsContext>();
    try
    {
        ctx.Database.Migrate();
        SeedData.Initialize(ctx);
    }
    catch (Exception ex)
    {
        Console.WriteLine("DB init error: " + ex.Message);
    }
}

app.Run();
