using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Test_Project_API_02.Models;
using Test_Project_API_02.Services;

var builder = WebApplication.CreateBuilder(args);

// ======================
// Services
// ======================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger + Authorize Button (JWT)
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Test Project API 02",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Jwt Service
builder.Services.AddScoped<JwtService>();

// CORS (for Frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ======================
// Authentication + JWT
// ======================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = builder.Configuration["Jwt:Key"];
        var issuer = builder.Configuration["Jwt:Issuer"];
        var audience = builder.Configuration["Jwt:Audience"];

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            // ✅ Blocked users cannot use OLD tokens
            OnTokenValidated = async context =>
            {
                var userIdStr =
                    context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier) ??
                    context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
                    context.Principal?.FindFirstValue("sub");

                if (string.IsNullOrWhiteSpace(userIdStr) || !int.TryParse(userIdStr, out var userId))
                {
                    context.Fail("Token does not contain valid user id.");
                    return;
                }

                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();

                var isBlocked = await db.Users
                    .AnyAsync(u => u.IdUser == userId && u.BlockStatus == "B");

                if (isBlocked)
                {
                    // ✅ علامة نستخدمها في OnChallenge عشان نرجع 403 برسالة
                    context.HttpContext.Items["AUTH_BLOCKED"] = true;

                    context.Fail("User is blocked");
                    return;
                }
            },

            // ✅ هنا هنحوّل blocked إلى 403 + JSON
            OnChallenge = async context =>
            {
                // لو blocked
                if (context.HttpContext.Items.ContainsKey("AUTH_BLOCKED"))
                {
                    context.HandleResponse(); // يمنع الـ 401 الافتراضي

                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/json; charset=utf-8";

                    await context.Response.WriteAsync("{\"message\":\"User is blocked\"}");
                    return;
                }

                // غير كده سيبه يرجع 401 عادي
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ======================
// Middleware pipeline
// ======================
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
