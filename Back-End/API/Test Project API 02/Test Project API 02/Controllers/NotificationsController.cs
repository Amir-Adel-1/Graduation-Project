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

        // GET: api/Notifications/my
        // يرجع إشعارات المستخدم الحالي
        [HttpGet("my")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = GetUserId();

            var notifications = await _context.Notifications
                .Where(n => n.IdUser == userId)
                .OrderByDescending(n => n.CreateAt)
                .Select(n => new
                {
                    n.IdNotification,
                    n.CreateAt,
                    n.IdRequest
                })
                .ToListAsync();

            return Ok(new
            {
                count = notifications.Count,
                notifications
            });
        }

        // DELETE: api/Notifications/{id}
        // (اختياري) يمسح إشعار واحد للمستخدم الحالي
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = GetUserId();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.IdNotification == id && n.IdUser == userId);

            if (notification == null)
                return NotFound(new { message = "Notification not found" });

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification deleted" });
        }
    }
}
