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
    [Authorize]
    public class MedicineRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MedicineRequestsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            // 1) ASP.NET mapped claim
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 2) raw JWT claim name
            if (string.IsNullOrWhiteSpace(id))
                id = User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            // 3) fallback literal
            if (string.IsNullOrWhiteSpace(id))
                id = User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(id))
                throw new Exception("Token does not contain user id.");

            return int.Parse(id);
        }

        // =========================
        // USER - Create Request
        // POST: api/MedicineRequests
        // =========================
        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] CreateMedicineRequestDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.MedicineName) || string.IsNullOrWhiteSpace(dto.Quantity))
                return BadRequest(new { message = "MedicineName and Quantity are required" });

            var userId = GetUserId();

            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                var request = new MedicineRequest
                {
                    MedicineName = dto.MedicineName,
                    Quantity = dto.Quantity,
                    OrderStatus = "P",   // Pending
                    IdUser = userId
                    // CreateAt في DB default
                };

                _context.MedicineRequests.Add(request);
                await _context.SaveChangesAsync(); // ✅ عشان IdRequest يتولد

                // ✅✅✅ إضافة Notification تلقائي عند إنشاء الطلب
                _context.Notifications.Add(new Notification
                {
                    IdUser = userId,
                    IdRequest = request.IdRequest
                    // CreateAt في DB default
                });

                await _context.SaveChangesAsync();

                await tx.CommitAsync();

                return Ok(new
                {
                    message = "Medicine request created successfully",
                    requestId = request.IdRequest
                });
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // =========================
        // USER - My Requests
        // GET: api/MedicineRequests/my
        // =========================
        [HttpGet("my")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userId = GetUserId();

            var requests = await _context.MedicineRequests
                .Where(r => r.IdUser == userId)
                .OrderByDescending(r => r.CreateAt)
                .AsNoTracking()
                .ToListAsync();

            return Ok(requests);
        }

        // =========================
        // USER - Responses for a specific request
        // GET: api/MedicineRequests/{requestId}/responses
        // =========================
        [HttpGet("{requestId:int}/responses")]
        public async Task<IActionResult> GetResponses(int requestId)
        {
            var userId = GetUserId();

            // تأكد إن الطلب بتاع نفس اليوزر
            var request = await _context.MedicineRequests
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.IdRequest == requestId && r.IdUser == userId);

            if (request == null)
                return NotFound(new { message = "Request not found" });

            var responses = await _context.MedicineAvailabilities
                .Where(a => a.IdRequest == requestId)
                .Select(a => new
                {
                    a.IdRequest,
                    PharmacistId = a.IdUserPh,
                    a.AvailableQuantity
                })
                .ToListAsync();

            return Ok(new
            {
                requestId,
                responsesCount = responses.Count,
                responses
            });
        }

        // =========================
        // PHARMACIST - Open Requests
        // GET: api/MedicineRequests/open
        // =========================
        [HttpGet("open")]
        [Authorize(Roles = "Pharmacist")]
        public async Task<IActionResult> GetOpenRequests()
        {
            var requests = await _context.MedicineRequests
                .Where(r => r.OrderStatus == "P")
                .OrderBy(r => r.CreateAt)
                .AsNoTracking()
                .ToListAsync();

            return Ok(requests);
        }

        // =========================
        // PHARMACIST - Respond to Request (creates availability)
        // POST: api/MedicineRequests/{requestId}/respond
        // =========================
        [HttpPost("{requestId:int}/respond")]
        [Authorize(Roles = "Pharmacist")]
        public async Task<IActionResult> RespondToRequest(int requestId, [FromBody] RespondToRequestDto dto)
        {
            if (dto == null || dto.AvailableQuantity <= 0)
                return BadRequest(new { message = "AvailableQuantity must be greater than 0" });

            var pharmacistId = GetUserId();

            var req = await _context.MedicineRequests
                .FirstOrDefaultAsync(r => r.IdRequest == requestId);

            if (req == null)
                return NotFound(new { message = "Request not found" });

            // الطلب لازم يكون Pending
            if (req.OrderStatus != "P")
                return BadRequest(new { message = "Request is not open" });

            // Upsert في Medicine_Availability (PK: Id_Request + Id_User_PH)
            var existing = await _context.MedicineAvailabilities
                .FirstOrDefaultAsync(a => a.IdRequest == requestId && a.IdUserPh == pharmacistId);

            if (existing != null)
            {
                existing.AvailableQuantity = dto.AvailableQuantity;
            }
            else
            {
                _context.MedicineAvailabilities.Add(new MedicineAvailability
                {
                    IdRequest = requestId,
                    IdUserPh = pharmacistId,
                    AvailableQuantity = dto.AvailableQuantity
                });
            }

            await _context.SaveChangesAsync();

            // ✅✅✅ إشعار لصاحب الطلب إن في صيدلي رد
            if (req.IdUser.HasValue)
            {
                _context.Notifications.Add(new Notification
                {
                    IdUser = req.IdUser.Value,
                    IdRequest = req.IdRequest
                });

                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Response saved" });
        }
    }

    // DTO للصيدلي يرد بالكمية المتاحة
    public class RespondToRequestDto
    {
        public int AvailableQuantity { get; set; }
    }
}
