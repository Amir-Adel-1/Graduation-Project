using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Test_Project_API_02.DTOs;
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
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(id))
                id = User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrWhiteSpace(id))
                id = User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(id))
                throw new Exception("Token does not contain user id.");

            return int.Parse(id);
        }

        // ======================================
        // GET: api/MedicineAvailability/my-responses
        // الصيدلي يشوف الطلبات اللي رد عليها
        // ======================================
        [HttpGet("my-responses")]
        public async Task<IActionResult> GetMyResponses()
        {
            var pharmacistId = GetUserId();

            var results = await _context.MedicineAvailabilities
                .Where(a => a.IdUserPh == pharmacistId) // لو IdUserPh int? هيتعامل EF، لكن غالبًا int
                .Join(
                    _context.MedicineRequests,
                    a => a.IdRequest,
                    r => r.IdRequest,
                    (a, r) => new
                    {
                        RequestId = r.IdRequest,
                        r.MedicineName,
                        RequestedQuantity = r.Quantity,
                        r.CreateAt,
                        RequestStatus = r.OrderStatus,
                        UserId = r.IdUser,
                        AvailableQuantity = a.AvailableQuantity,
                        IsFullAvailable = a.AvailableQuantity == 0
                    }
                )
                .OrderByDescending(x => x.CreateAt)
                .ToListAsync();

            return Ok(new
            {
                pharmacistId,
                count = results.Count,
                responses = results
            });
        }

        // ======================================
        // POST: api/MedicineAvailability/respond
        // 0 = متوفر بالكامل
        // >0 = متوفر جزئيًا
        // ======================================
        [HttpPost("respond")]
        public async Task<IActionResult> Respond([FromBody] RespondMedicineAvailabilityDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Request body is required" });

            if (dto.RequestId <= 0)
                return BadRequest(new { message = "RequestId is required" });

            if (dto.AvailableQuantity < 0)
                return BadRequest(new { message = "AvailableQuantity must be 0 (full) or greater than 0" });

            var pharmacistId = GetUserId();

            var request = await _context.MedicineRequests
                .FirstOrDefaultAsync(r => r.IdRequest == dto.RequestId);

            if (request == null)
                return NotFound(new { message = "Request not found" });

            // ✅ FIX: IdUser غالبًا int? (nullable)
            if (!request.IdUser.HasValue)
                return BadRequest(new { message = "This request has no user id" });

            var already = await _context.MedicineAvailabilities
                .AnyAsync(a => a.IdRequest == dto.RequestId && a.IdUserPh == pharmacistId);

            if (already)
                return BadRequest(new { message = "You already responded to this request" });

            var availability = new MedicineAvailability
            {
                IdRequest = dto.RequestId,
                IdUserPh = pharmacistId,
                AvailableQuantity = dto.AvailableQuantity
            };

            _context.MedicineAvailabilities.Add(availability);

            // ✅ FIX: استخدم Value
            var notification = new Notification
            {
                IdUser = request.IdUser.Value,
                IdRequest = request.IdRequest,
                CreateAt = DateTime.Now
            };

            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Availability submitted successfully",
                availability = new
                {
                    dto.RequestId,
                    PharmacistId = pharmacistId,
                    isFullAvailable = dto.AvailableQuantity == 0,
                    availableQuantity = dto.AvailableQuantity
                },
                notificationId = notification.IdNotification
            });
        }
    }
}
