using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Test_Project_API_02.Models;

namespace Test_Project_API_02.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
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

        // ✅ NEW: احصل على أحدث كارت للمستخدم (نفس منطق OrdersController)
        private async Task<Cart?> GetLatestUserCartAsync(int userId, bool includeItems = true)
        {
            var q = _context.Carts
                .Where(c => c.IdUser.HasValue && c.IdUser.Value == userId)
                .OrderByDescending(c => c.IdCart)
                .AsQueryable();

            if (includeItems)
                q = q.Include(c => c.CartItems);

            return await q.FirstOrDefaultAsync();
        }

        private async Task<Cart> GetOrCreateCartAsync(int userId)
        {
            var cart = await GetLatestUserCartAsync(userId, includeItems: true);

            if (cart != null)
                return cart;

            cart = new Cart
            {
                IdUser = userId,
                TotalProducts = 0,
                TotalPrice = 0
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            // رجّع نفس الكارت اللي اتعمل
            cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstAsync(c => c.IdCart == cart.IdCart);

            return cart;
        }

        private async Task RecalculateCartTotalsAsync(Cart cart)
        {
            var items = await _context.CartItems
                .Where(i => i.IdCart.HasValue && i.IdCart.Value == cart.IdCart)
                .ToListAsync();

            cart.TotalProducts = items.Sum(i => i.Quantity);
            cart.TotalPrice = items.Sum(i => i.Price * i.Quantity);

            await _context.SaveChangesAsync();
        }

        // ==========================================
        // GET: api/Cart/my
        // ==========================================
        [HttpGet("my")]
        public async Task<IActionResult> GetMyCart()
        {
            var userId = GetUserId();

            // ✅ بدل FirstOrDefault -> latest
            var cart = await GetLatestUserCartAsync(userId, includeItems: true);

            if (cart == null)
                return Ok(new
                {
                    message = "Cart is empty",
                    cart = new
                    {
                        IdCart = 0,
                        TotalProducts = 0,
                        TotalPrice = 0,
                        Items = new object[] { }
                    }
                });

            return Ok(new
            {
                cart.IdCart,
                cart.TotalProducts,
                cart.TotalPrice,
                Items = cart.CartItems.Select(i => new
                {
                    i.IdCartItem,
                    i.ProductApiName,
                    i.Quantity,
                    i.Price,
                    i.ImageUrl,
                    LineTotal = i.Price * i.Quantity
                })
            });
        }

        // ==========================================
        // POST: api/Cart/items
        // ==========================================
        [HttpPost("items")]
        public async Task<IActionResult> AddItem([FromBody] AddToCartDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid data" });

            if (string.IsNullOrWhiteSpace(dto.ProductApiName))
                return BadRequest(new { message = "ProductApiName is required" });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0" });

            if (dto.Price < 0)
                return BadRequest(new { message = "Price must be 0 or greater" });

            var userId = GetUserId();
            var cart = await GetOrCreateCartAsync(userId);

            var existing = await _context.CartItems.FirstOrDefaultAsync(i =>
                i.IdCart.HasValue && i.IdCart.Value == cart.IdCart &&
                i.ProductApiName == dto.ProductApiName);

            if (existing != null)
            {
                existing.Quantity += dto.Quantity;
                existing.Price = dto.Price;
                existing.ImageUrl = dto.ImageUrl;
            }
            else
            {
                var item = new CartItem
                {
                    IdCart = cart.IdCart,
                    ProductApiName = dto.ProductApiName,
                    Quantity = dto.Quantity,
                    Price = dto.Price,
                    ImageUrl = dto.ImageUrl
                };

                _context.CartItems.Add(item);
            }

            await _context.SaveChangesAsync();
            await RecalculateCartTotalsAsync(cart);

            return Ok(new { message = "Item added to cart" });
        }

        // ==========================================
        // PUT: api/Cart/items/{itemId}
        // ==========================================
        [HttpPut("items/{itemId:int}")]
        public async Task<IActionResult> UpdateItemQuantity(int itemId, [FromBody] UpdateCartItemDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid data" });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0" });

            var userId = GetUserId();

            // ✅ بدل FirstOrDefault -> latest
            var cart = await GetLatestUserCartAsync(userId, includeItems: false);

            if (cart == null)
                return NotFound(new { message = "Cart not found" });

            var item = await _context.CartItems
                .FirstOrDefaultAsync(i =>
                    i.IdCartItem == itemId &&
                    i.IdCart.HasValue && i.IdCart.Value == cart.IdCart);

            if (item == null)
                return NotFound(new { message = "Cart item not found" });

            item.Quantity = dto.Quantity;

            if (dto.Price.HasValue)
            {
                if (dto.Price.Value < 0)
                    return BadRequest(new { message = "Price must be 0 or greater" });

                item.Price = dto.Price.Value;
            }

            await _context.SaveChangesAsync();
            await RecalculateCartTotalsAsync(cart);

            return Ok(new { message = "Cart item updated" });
        }

        // ==========================================
        // DELETE: api/Cart/items/{itemId}
        // ==========================================
        [HttpDelete("items/{itemId:int}")]
        public async Task<IActionResult> RemoveItem(int itemId)
        {
            var userId = GetUserId();

            // ✅ بدل FirstOrDefault -> latest
            var cart = await GetLatestUserCartAsync(userId, includeItems: false);

            if (cart == null)
                return NotFound(new { message = "Cart not found" });

            var item = await _context.CartItems
                .FirstOrDefaultAsync(i =>
                    i.IdCartItem == itemId &&
                    i.IdCart.HasValue && i.IdCart.Value == cart.IdCart);

            if (item == null)
                return NotFound(new { message = "Cart item not found" });

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
            await RecalculateCartTotalsAsync(cart);

            return Ok(new { message = "Item removed from cart" });
        }

        // ==========================================
        // DELETE: api/Cart/clear
        // ==========================================
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();

            // ✅ بدل FirstOrDefault -> latest
            var cart = await GetLatestUserCartAsync(userId, includeItems: false);

            if (cart == null)
                return NotFound(new { message = "Cart not found" });

            var items = await _context.CartItems
                .Where(i => i.IdCart.HasValue && i.IdCart.Value == cart.IdCart)
                .ToListAsync();

            _context.CartItems.RemoveRange(items);

            cart.TotalProducts = 0;
            cart.TotalPrice = 0;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cart cleared successfully" });
        }
    }

    // =========================
    // DTOs
    // =========================
    public class AddToCartDto
    {
        public string ProductApiName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateCartItemDto
    {
        public int Quantity { get; set; }
        public decimal? Price { get; set; }
    }
}
