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

        // ======================================
        // GET: api/Favorites/my
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
                    f.ProductApiName,
                    f.Price,
                    f.ImageUrl
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
            if (dto == null)
                return BadRequest(new { message = "Invalid data" });

            if (string.IsNullOrWhiteSpace(dto.ProductApiName))
                return BadRequest(new { message = "ProductApiName is required" });

            if (dto.Price < 0)
                return BadRequest(new { message = "Price must be 0 or greater" });

            var userId = GetUserId();

            var exists = await _context.Favorites
                .AnyAsync(f => f.IdUser == userId && f.ProductApiName == dto.ProductApiName);

            if (exists)
                return BadRequest(new { message = "Product already in favorites" });

            var favorite = new Favorite
            {
                IdUser = userId,
                ProductApiName = dto.ProductApiName,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl
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

        // ======================================
        // ✅ DELETE: api/Favorites/clear
        // تفريغ المفضلة
        // ======================================
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearFavorites()
        {
            var userId = GetUserId();

            var items = await _context.Favorites
                .Where(f => f.IdUser == userId)
                .ToListAsync();

            _context.Favorites.RemoveRange(items);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Favorites cleared successfully" });
        }

        // ======================================
        // ✅ POST: api/Favorites/toggle  (اختياري)
        // لو موجود يشيله، لو مش موجود يضيفه
        // ======================================
        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFavorite([FromBody] AddFavoriteDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.ProductApiName))
                return BadRequest(new { message = "ProductApiName is required" });

            var userId = GetUserId();

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f => f.IdUser == userId && f.ProductApiName == dto.ProductApiName);

            if (existing != null)
            {
                _context.Favorites.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Removed from favorites", isFavorite = false });
            }

            var favorite = new Favorite
            {
                IdUser = userId,
                ProductApiName = dto.ProductApiName,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Added to favorites", isFavorite = true, favoriteId = favorite.IdFavorite });
        }
    }
}
