using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Test_Project_API_02.Models;

namespace Test_Project_API_02.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Pharmacist")]
    public class MedicineAvailabilityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MedicineAvailabilityController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                     ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(id))
                throw new Exception("Token does not contain user id.");

            return int.Parse(id);
        }

        public class AddAvailabilityDto
        {
            public int IdRequest { get; set; }
            public int AvailableQuantity { get; set; }
        }

        // POST: api/MedicineAvailability
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] AddAvailabilityDto dto)
        {
            if (dto.IdRequest <= 0 || dto.AvailableQuantity <= 0)
                return BadRequest(new { message = "Invalid data" });

            var pharmacistId = GetUserId();

            // الطلب موجود؟
            var req = await _context.MedicineRequests
                .FirstOrDefaultAsync(r => r.IdRequest == dto.IdRequest);

            if (req == null)
                return NotFound(new { message = "Request not found" });

            // ✅ منع الرد مرتين
            var exists = await _context.MedicineAvailabilities
                .AnyAsync(a => a.IdRequest == dto.IdRequest && a.IdUserPh == pharmacistId);

            if (exists)
                return BadRequest(new { message = "You already responded to this request" });

            // ✅ إضافة رد الصيدلي
            var availability = new MedicineAvailability
            {
                IdRequest = dto.IdRequest,
                IdUserPh = pharmacistId,
                AvailableQuantity = dto.AvailableQuantity
            };

            _context.MedicineAvailabilities.Add(availability);

            // ✅ إنشاء Notification جديدة لليوزر صاحب الطلب
            var notif = new Notification
            {
                IdUser = req.IdUser,
                IdRequest = req.IdRequest,
                IdUserPh = pharmacistId,
                IsRead = false
                // CreateAt default من DB
            };

            _context.Notifications.Add(notif);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Response added + notification created" });
        }
    }
}
