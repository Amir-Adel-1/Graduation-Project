using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Test_Project_API_02.Models;
using Test_Project_API_02.DTOs;

namespace Test_Project_API_02.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // ✅ أي endpoint هنا لازم يكون بتوكن
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var id =
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
                User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(id))
                throw new Exception("Token does not contain user id.");

            return int.Parse(id);
        }

        private bool IsAdmin() => User.IsInRole("Admin");

        private bool IsSameUserOrAdmin(int targetUserId)
        {
            if (IsAdmin()) return true;
            return GetUserId() == targetUserId;
        }

        // =========================
        // ✅ GET: api/Users/me  (Current logged-in user)
        // =========================
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userId = GetUserId();

            var me = await _context.Users
                .AsNoTracking()
                .Where(u => u.IdUser == userId)
                .Select(u => new
                {
                    u.IdUser,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Role,
                    u.BlockStatus,

                    // اول رقم تليفون (لأنك بتخزن واحد بس غالباً)
                    Phone = u.UsersPhones
                        .Select(p => p.Phone)
                        .FirstOrDefault(),

                    // اول عنوان (لأنك بتخزن واحد بس غالباً)
                    Address = u.UsersAddresses
                        .Select(a => a.Address)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (me == null)
                return NotFound(new { message = "User not found" });

            return Ok(me);
        }

        // =========================
        // GET: api/Users  (Admin only)
        // =========================
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Select(u => new
                {
                    u.IdUser,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Role,
                    u.BlockStatus
                })
                .ToListAsync();

            return Ok(users);
        }

        // =========================
        // GET: api/Users/{id} (Admin only)
        // =========================
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.UsersAddresses)
                .Include(u => u.UsersPhones)
                .Include(u => u.UsersChronicDiseases)
                .Include(u => u.UsersAllergies)
                .FirstOrDefaultAsync(u => u.IdUser == id);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        // =========================
        // PUT: api/Users/{id} (Admin only)
        // =========================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, User updatedUser)
        {
            if (id != updatedUser.IdUser)
                return BadRequest(new { message = "ID mismatch" });

            _context.Entry(updatedUser).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User updated successfully" });
        }

        // =========================
        // PUT: api/Users/{id}/profile (User نفسه أو Admin)
        // =========================
        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(int id, UpdateProfileDto dto)
        {
            if (!IsSameUserOrAdmin(id))
                return Forbid();

            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (!string.IsNullOrEmpty(dto.Password))
                user.Password = dto.Password;

            if (dto.Weight.HasValue)
                user.Weight = dto.Weight;

            if (dto.Height.HasValue)
                user.Height = dto.Height;

            if (!string.IsNullOrEmpty(dto.BloodType))
                user.BloodType = dto.BloodType;

            if (!string.IsNullOrEmpty(dto.HealthStatus))
                user.HealthStatus = dto.HealthStatus;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }

        // =========================
        // PUT: api/Users/{id}/address (User نفسه أو Admin)
        // =========================
        [HttpPut("{id}/address")]
        public async Task<IActionResult> UpdateAddress(int id, UpdateAddressDto dto)
        {
            if (!IsSameUserOrAdmin(id))
                return Forbid();

            var address = await _context.UsersAddresses
                .FirstOrDefaultAsync(a => a.IdUser == id);

            if (address != null)
                _context.UsersAddresses.Remove(address);

            _context.UsersAddresses.Add(new UsersAddress
            {
                IdUser = id,
                Address = dto.Address
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Address updated successfully" });
        }

        // =========================
        // PUT: api/Users/{id}/phone (User نفسه أو Admin)
        // =========================
        [HttpPut("{id}/phone")]
        public async Task<IActionResult> UpdatePhone(int id, UpdatePhoneDto dto)
        {
            if (!IsSameUserOrAdmin(id))
                return Forbid();

            var phone = await _context.UsersPhones
                .FirstOrDefaultAsync(p => p.IdUser == id);

            if (phone != null)
                _context.UsersPhones.Remove(phone);

            _context.UsersPhones.Add(new UsersPhone
            {
                IdUser = id,
                Phone = dto.Phone
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Phone updated successfully" });
        }

        // =========================
        // PUT: api/Users/{id}/chronic-disease (User نفسه أو Admin)
        // =========================
        [HttpPut("{id}/chronic-disease")]
        public async Task<IActionResult> UpdateChronicDisease(int id, UpdateChronicDiseaseDto dto)
        {
            if (!IsSameUserOrAdmin(id))
                return Forbid();

            var disease = await _context.UsersChronicDiseases
                .FirstOrDefaultAsync(d => d.IdUser == id);

            if (disease != null)
                _context.UsersChronicDiseases.Remove(disease);

            _context.UsersChronicDiseases.Add(new UsersChronicDisease
            {
                IdUser = id,
                ChronicDiseaseName = dto.ChronicDiseaseName,
                DiseaseType = dto.DiseaseType
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Chronic disease updated successfully" });
        }

        // =========================
        // PUT: api/Users/{id}/allergy (User نفسه أو Admin)
        // =========================
        [HttpPut("{id}/allergy")]
        public async Task<IActionResult> UpdateAllergy(int id, UpdateAllergyDto dto)
        {
            if (!IsSameUserOrAdmin(id))
                return Forbid();

            var allergy = await _context.UsersAllergies
                .FirstOrDefaultAsync(a => a.IdUser == id);

            if (allergy != null)
                _context.UsersAllergies.Remove(allergy);

            _context.UsersAllergies.Add(new UsersAllergy
            {
                IdUser = id,
                Allergies = dto.Allergies
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Allergy updated successfully" });
        }

        // =========================
        // DELETE: api/Users/{id} (Admin only)
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound(new { message = "User not found" });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully" });
        }
    }
}
