using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Test_Project_API_02.Models;

namespace Test_Project_API_02.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // =========================
        // Users
        // =========================

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Where(u => u.Role == "User")
                .OrderByDescending(u => u.CreateAt)
                .Select(u => new
                {
                    u.IdUser,
                    FullName = (u.FirstName + " " + u.LastName).Trim(),
                    u.Email,
                    Phone = _context.UsersPhones
                        .Where(p => p.IdUser == u.IdUser)
                        .Select(p => p.Phone)
                        .FirstOrDefault(),
                    u.CreateAt,
                    u.BlockStatus
                })
                .ToListAsync();

            return Ok(new { count = users.Count, users });
        }

        [HttpPut("users/{id:int}/block")]
        public async Task<IActionResult> BlockUser(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUser == id && u.Role == "User");
            if (user == null) return NotFound(new { message = "User not found" });

            user.BlockStatus = "B";
            await _context.SaveChangesAsync();

            return Ok(new { message = "User blocked" });
        }

        [HttpPut("users/{id:int}/unblock")]
        public async Task<IActionResult> UnblockUser(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUser == id && u.Role == "User");
            if (user == null) return NotFound(new { message = "User not found" });

            user.BlockStatus = "A";
            await _context.SaveChangesAsync();

            return Ok(new { message = "User unblocked" });
        }

        // DELETE: api/Admin/users/{id}  (Hard Delete)
        [HttpDelete("users/{id:int}")]
        public async Task<IActionResult> DeleteUserPermanently(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUser == id && u.Role == "User");
            if (user == null) return NotFound(new { message = "User not found" });

            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1) Basic related tables
                _context.UsersAddresses.RemoveRange(_context.UsersAddresses.Where(x => x.IdUser == id));
                _context.UsersPhones.RemoveRange(_context.UsersPhones.Where(x => x.IdUser == id));
                _context.UsersAllergies.RemoveRange(_context.UsersAllergies.Where(x => x.IdUser == id));
                _context.UsersChronicDiseases.RemoveRange(_context.UsersChronicDiseases.Where(x => x.IdUser == id));

                // 2) Favorites
                _context.Favorites.RemoveRange(_context.Favorites.Where(f => f.IdUser == id));

                // 3) Notifications of this user (IdUser nullable)
                _context.Notifications.RemoveRange(
                    _context.Notifications.Where(n => n.IdUser.HasValue && n.IdUser.Value == id)
                );

                // 4) Medicine requests of this user (IdUser nullable) + dependencies
                var userRequestIds = await _context.MedicineRequests
                    .Where(r => r.IdUser.HasValue && r.IdUser.Value == id)
                    .Select(r => r.IdRequest)
                    .ToListAsync();

                if (userRequestIds.Count > 0)
                {
                    _context.MedicineAvailabilities.RemoveRange(
                        _context.MedicineAvailabilities.Where(a => userRequestIds.Contains(a.IdRequest))
                    );

                    _context.Notifications.RemoveRange(
                        _context.Notifications.Where(n => n.IdRequest.HasValue && userRequestIds.Contains(n.IdRequest.Value))
                    );

                    _context.MedicineRequests.RemoveRange(
                        _context.MedicineRequests.Where(r => r.IdUser.HasValue && r.IdUser.Value == id)
                    );
                }

                // 5) Cart + CartItems
                var cartIds = await _context.Carts
                    .Where(c => c.IdUser.HasValue && c.IdUser.Value == id)
                    .Select(c => c.IdCart)
                    .ToListAsync();

                if (cartIds.Count > 0)
                {
                    // ✅ FIX: i.IdCart is int? so use HasValue/Value
                    _context.CartItems.RemoveRange(
                        _context.CartItems.Where(i => i.IdCart.HasValue && cartIds.Contains(i.IdCart.Value))
                    );
                }

                // 6) Orders (IdUser nullable)
                _context.Orders.RemoveRange(
                    _context.Orders.Where(o => o.IdUser.HasValue && o.IdUser.Value == id)
                );

                // 7) Remove carts
                _context.Carts.RemoveRange(
                    _context.Carts.Where(c => c.IdUser.HasValue && c.IdUser.Value == id)
                );

                // 8) Finally remove user
                _context.Users.Remove(user);

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                return Ok(new { message = "User deleted permanently" });
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // =========================
        // Pharmacists
        // =========================

        [HttpGet("pharmacists")]
        public async Task<IActionResult> GetPharmacists()
        {
            var pharmacists = await _context.Users
                .Where(u => u.Role == "Pharmacist")
                .OrderByDescending(u => u.CreateAt)
                .Select(u => new
                {
                    u.IdUser,
                    PharmacyName = (u.FirstName + " " + u.LastName).Trim(),
                    u.Email,
                    Address = _context.UsersAddresses
                        .Where(a => a.IdUser == u.IdUser)
                        .Select(a => a.Address)
                        .FirstOrDefault(),
                    Phone = _context.UsersPhones
                        .Where(p => p.IdUser == u.IdUser)
                        .Select(p => p.Phone)
                        .FirstOrDefault(),
                    u.CreateAt,
                    u.BlockStatus
                })
                .ToListAsync();

            return Ok(new { count = pharmacists.Count, pharmacists });
        }

        [HttpPut("pharmacists/{id:int}/block")]
        public async Task<IActionResult> BlockPharmacist(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUser == id && u.Role == "Pharmacist");
            if (user == null) return NotFound(new { message = "Pharmacist not found" });

            user.BlockStatus = "B";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Pharmacist blocked" });
        }

        [HttpPut("pharmacists/{id:int}/unblock")]
        public async Task<IActionResult> UnblockPharmacist(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUser == id && u.Role == "Pharmacist");
            if (user == null) return NotFound(new { message = "Pharmacist not found" });

            user.BlockStatus = "A";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Pharmacist unblocked" });
        }

        // DELETE: api/Admin/pharmacists/{id} (Hard Delete)
        [HttpDelete("pharmacists/{id:int}")]
        public async Task<IActionResult> DeletePharmacistPermanently(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUser == id && u.Role == "Pharmacist");
            if (user == null) return NotFound(new { message = "Pharmacist not found" });

            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.UsersAddresses.RemoveRange(_context.UsersAddresses.Where(x => x.IdUser == id));
                _context.UsersPhones.RemoveRange(_context.UsersPhones.Where(x => x.IdUser == id));

                // pharmacist responses
                _context.MedicineAvailabilities.RemoveRange(
                    _context.MedicineAvailabilities.Where(a => a.IdUserPh == id)
                );

                // notifications/favorites (in case)
                _context.Favorites.RemoveRange(_context.Favorites.Where(f => f.IdUser == id));
                _context.Notifications.RemoveRange(
                    _context.Notifications.Where(n => n.IdUser.HasValue && n.IdUser.Value == id)
                );

                // carts/items/orders (if pharmacist also can buy)
                var cartIds = await _context.Carts
                    .Where(c => c.IdUser.HasValue && c.IdUser.Value == id)
                    .Select(c => c.IdCart)
                    .ToListAsync();

                if (cartIds.Count > 0)
                {
                    // ✅ FIX: i.IdCart is int?
                    _context.CartItems.RemoveRange(
                        _context.CartItems.Where(i => i.IdCart.HasValue && cartIds.Contains(i.IdCart.Value))
                    );
                }

                _context.Orders.RemoveRange(
                    _context.Orders.Where(o => o.IdUser.HasValue && o.IdUser.Value == id)
                );

                _context.Carts.RemoveRange(
                    _context.Carts.Where(c => c.IdUser.HasValue && c.IdUser.Value == id)
                );

                _context.Users.Remove(user);

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                return Ok(new { message = "Pharmacist deleted permanently" });
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // =========================
        // Requests
        // =========================

        [HttpGet("medicine-requests")]
        public async Task<IActionResult> GetMedicineRequests()
        {
            var list = await _context.MedicineRequests
                .OrderByDescending(r => r.CreateAt)
                .Select(r => new
                {
                    r.IdRequest,
                    r.MedicineName,
                    r.Quantity,
                    r.CreateAt,
                    r.OrderStatus,
                    r.IdUser,
                    ResponsesCount = _context.MedicineAvailabilities.Count(a => a.IdRequest == r.IdRequest)
                })
                .ToListAsync();

            return Ok(new { count = list.Count, requests = list });
        }

        [HttpDelete("medicine-requests/{id:int}")]
        public async Task<IActionResult> DeleteMedicineRequest(int id)
        {
            var req = await _context.MedicineRequests.FirstOrDefaultAsync(r => r.IdRequest == id);
            if (req == null) return NotFound(new { message = "Request not found" });

            _context.MedicineAvailabilities.RemoveRange(_context.MedicineAvailabilities.Where(a => a.IdRequest == id));
            _context.Notifications.RemoveRange(_context.Notifications.Where(n => n.IdRequest.HasValue && n.IdRequest.Value == id));

            _context.MedicineRequests.Remove(req);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Request deleted" });
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalUsers = await _context.Users.CountAsync(u => u.Role == "User");
            var totalPharmacists = await _context.Users.CountAsync(u => u.Role == "Pharmacist");
            var blocked = await _context.Users.CountAsync(u => u.BlockStatus == "B");
            var requests = await _context.MedicineRequests.CountAsync();
            var orders = await _context.Orders.CountAsync();

            return Ok(new
            {
                totalUsers,
                totalPharmacists,
                blocked,
                requests,
                orders
            });
        }
    }
}
