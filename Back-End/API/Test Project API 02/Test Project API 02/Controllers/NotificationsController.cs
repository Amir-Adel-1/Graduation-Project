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
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationsController(AppDbContext context)
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
        // GET: api/Notifications/my
        // ======================================
        [HttpGet("my")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = GetUserId();

            var list = await _context.Notifications
                .Where(n => n.IdUser == userId)
                .OrderByDescending(n => n.CreateAt)
                .Select(n => new
                {
                    n.IdNotification,
                    n.CreateAt,
                    n.IdRequest,
                    n.IsRead,
                    pharmacyName =
                        (n.IdUserPhNavigation != null
                            ? (n.IdUserPhNavigation.FirstName + " " + n.IdUserPhNavigation.LastName)
                            : "صيدلية")
                })
                .ToListAsync();

            // ✅ العداد: غير المقروء بس
            var unreadCount = list.Count(x => x.IsRead == false);

            return Ok(new
            {
                count = unreadCount,
                notifications = list
            });
        }

        // ======================================
        // GET: api/Notifications/{id}/details
        // ======================================
        [HttpGet("{id:int}/details")]
        public async Task<IActionResult> GetNotificationDetails(int id)
        {
            var userId = GetUserId();

            var notif = await _context.Notifications
                .Include(n => n.IdUserPhNavigation)
                .FirstOrDefaultAsync(n => n.IdNotification == id && n.IdUser == userId);

            if (notif == null)
                return NotFound(new { message = "Notification not found" });

            var ph = notif.IdUserPhNavigation;

            // Phones/Addresses اختياري حسب جداولك
            var phone = await _context.UsersPhones
                .Where(p => p.IdUser == notif.IdUserPh)
                .Select(p => p.Phone)
                .FirstOrDefaultAsync();

            var address = await _context.UsersAddresses
                .Where(a => a.IdUser == notif.IdUserPh)
                .Select(a => a.Address)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                pharmacyName = ph != null ? (ph.FirstName + " " + ph.LastName) : "صيدلية",
                email = ph?.Email ?? "",
                phone = phone ?? "",
                address = address ?? "",
                requestId = notif.IdRequest,
                createAt = notif.CreateAt,
                isRead = notif.IsRead
            });
        }

        // ======================================
        // PUT: api/Notifications/{id}/read
        // ======================================
        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            var userId = GetUserId();

            var notif = await _context.Notifications
                .FirstOrDefaultAsync(n => n.IdNotification == id && n.IdUser == userId);

            if (notif == null)
                return NotFound(new { message = "Notification not found" });

            if (!notif.IsRead)
            {
                notif.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Marked as read" });
        }
    }
}
