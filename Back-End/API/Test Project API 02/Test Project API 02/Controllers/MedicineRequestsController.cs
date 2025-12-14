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
            if (string.IsNullOrWhiteSpace(dto.MedicineName) || string.IsNullOrWhiteSpace(dto.Quantity))
                return BadRequest(new { message = "MedicineName and Quantity are required" });

            var userId = GetUserId();

            var request = new MedicineRequest
            {
                MedicineName = dto.MedicineName,
                Quantity = dto.Quantity,
                OrderStatus = "P",   // Pending
                IdUser = userId
            };

            _context.MedicineRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Medicine request created successfully",
                requestId = request.IdRequest
            });
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
                .ToListAsync();

            return Ok(requests);
        }
    }
}
