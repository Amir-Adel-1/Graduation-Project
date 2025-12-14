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
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritesController(AppDbContext context)
        {
            _context = context;
        }

        // ============= Helper =============
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
        // GET: api/Favorites/my
        // عرض مفضلة المستخدم الحالي
        // ======================================
        [HttpGet("my")]
        public async Task<IActionResult> GetMyFavorites()
        {
            var userId = GetUserId();

            var favorites = await _context.Favorites
                .Where(f => f.IdUser == userId)
                .OrderByDescending(f => f.IdFavorite)
                .Select(f => new
                {
                    f.IdFavorite,
                    f.ProductApiName
                })
                .ToListAsync();

            return Ok(new
            {
                count = favorites.Count,
                favorites
            });
        }

        // ======================================
        // POST: api/Favorites
        // إضافة منتج للمفضلة
        // ======================================
        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ProductApiName))
                return BadRequest(new { message = "ProductApiName is required" });

            var userId = GetUserId();

            var exists = await _context.Favorites
                .AnyAsync(f => f.IdUser == userId && f.ProductApiName == dto.ProductApiName);

            if (exists)
                return BadRequest(new { message = "Product already in favorites" });

            var favorite = new Favorite
            {
                IdUser = userId,
                ProductApiName = dto.ProductApiName
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Added to favorites",
                favoriteId = favorite.IdFavorite
            });
        }

        // ======================================
        // DELETE: api/Favorites/{id}
        // حذف من المفضلة بالـ id
        // ======================================
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> RemoveFavorite(int id)
        {
            var userId = GetUserId();

            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.IdFavorite == id && f.IdUser == userId);

            if (favorite == null)
                return NotFound(new { message = "Favorite not found" });

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Removed from favorites" });
        }
    }
}
