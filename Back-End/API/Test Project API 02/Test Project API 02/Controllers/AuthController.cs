using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Test_Project_API_02.DTOs;
using Test_Project_API_02.Models;
using Test_Project_API_02.Models.DTOs;
using Test_Project_API_02.Services;

namespace Test_Project_API_02.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;

        public AuthController(AppDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // =========================
        // POST: api/Auth/register
        // Register Normal User
        // =========================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userExists = await _context.Users
                .AnyAsync(u => u.Email == dto.Email);

            if (userExists)
                return BadRequest(new { message = "Email already exists" });

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                Email = dto.Email,
                Password = dto.Password, // لاحقًا Hash
                Role = "User",
                Weight = dto.Weight,
                Height = dto.Height,
                BloodType = dto.BloodType,
                HealthStatus = dto.HealthStatus,
                BlockStatus = "A"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User registered successfully",
                user.IdUser,
                user.FirstName,
                user.Email
            });
        }

        // =========================
        // POST: api/Auth/register-pharmacist
        // =========================
        [HttpPost("register-pharmacist")]
        public async Task<IActionResult> RegisterPharmacist([FromBody] CreatePharmacistDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var exists = await _context.Users
                .AnyAsync(u => u.Email == dto.Email);

            if (exists)
                return BadRequest(new { message = "Email already exists" });

            var pharmacist = new User
            {
                FirstName = "صيدلية",
                LastName = dto.PharmacyName,
                Email = dto.Email,
                Password = dto.Password,
                Role = "Pharmacist",
                BlockStatus = "A"
            };

            _context.Users.Add(pharmacist);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Pharmacist registered successfully",
                pharmacist.IdUser,
                pharmacist.FirstName,
                pharmacist.LastName,
                pharmacist.Email
            });
        }

        // =========================
        // POST: api/Auth/login
        // =========================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || user.Password != dto.Password)
                return Unauthorized(new { message = "Invalid email or password" });

            // ✅ هنا التعديل
            if (user.BlockStatus == "B")
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "User is blocked" });

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                message = "Login successful",
                token,
                user = new
                {
                    user.IdUser,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.Role
                }
            });
        }
    }
}
