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

        private async Task<Cart> GetOrCreateCartAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.IdUser.HasValue && c.IdUser.Value == userId);

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

            // reload with items
            cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstAsync(c => c.IdCart == cart.IdCart);

            return cart;
        }

        private async Task RecalculateCartTotalsAsync(Cart cart)
        {
            // cart.CartItems ممكن تكون null؟ في موديلك initialized، بس احتياط
            var items = await _context.CartItems
                .Where(i => i.IdCart.HasValue && i.IdCart.Value == cart.IdCart)
                .ToListAsync();

            cart.TotalProducts = items.Sum(i => i.Quantity);
            cart.TotalPrice = items.Sum(i => i.Price * i.Quantity);

            await _context.SaveChangesAsync();
        }

        // ==========================================
        // GET: api/Cart/my
        // يرجع الكارت بتاع اليوزر + items
        // ==========================================
        [HttpGet("my")]
        public async Task<IActionResult> GetMyCart()
        {
            var userId = GetUserId();

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.IdUser.HasValue && c.IdUser.Value == userId);

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
                    i.Price
                })
            });
        }

        // ==========================================
        // POST: api/Cart/items
        // إضافة منتج للكارت
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

            // لو نفس المنتج موجود قبل كده: نزود الكمية ونعمل متوسط/نفس السعر (هنثبت السعر القادم)
            var existing = await _context.CartItems.FirstOrDefaultAsync(i =>
                i.IdCart.HasValue && i.IdCart.Value == cart.IdCart &&
                i.ProductApiName == dto.ProductApiName);

            if (existing != null)
            {
                existing.Quantity += dto.Quantity;
                existing.Price = dto.Price; // آخر سعر
            }
            else
            {
                var item = new CartItem
                {
                    IdCart = cart.IdCart,
                    ProductApiName = dto.ProductApiName,
                    Quantity = dto.Quantity,
                    Price = dto.Price
                };

                _context.CartItems.Add(item);
            }

            await _context.SaveChangesAsync();
            await RecalculateCartTotalsAsync(cart);

            return Ok(new { message = "Item added to cart" });
        }

        // ==========================================
        // PUT: api/Cart/items/{itemId}
        // تعديل كمية item
        // ==========================================
        [HttpPut("items/{itemId:int}")]
        public async Task<IActionResult> UpdateItemQuantity(int itemId, [FromBody] UpdateCartItemDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid data" });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0" });

            var userId = GetUserId();

            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.IdUser.HasValue && c.IdUser.Value == userId);

            if (cart == null)
                return NotFound(new { message = "Cart not found" });

            var item = await _context.CartItems
                .FirstOrDefaultAsync(i => i.IdCartItem == itemId && i.IdCart.HasValue && i.IdCart.Value == cart.IdCart);

            if (item == null)
                return NotFound(new { message = "Cart item not found" });

            item.Quantity = dto.Quantity;

            // لو عايز تحدث السعر كمان (اختياري)
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
        // حذف item واحد من الكارت
        // ==========================================
        [HttpDelete("items/{itemId:int}")]
        public async Task<IActionResult> RemoveItem(int itemId)
        {
            var userId = GetUserId();

            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.IdUser.HasValue && c.IdUser.Value == userId);

            if (cart == null)
                return NotFound(new { message = "Cart not found" });

            var item = await _context.CartItems
                .FirstOrDefaultAsync(i => i.IdCartItem == itemId && i.IdCart.HasValue && i.IdCart.Value == cart.IdCart);

            if (item == null)
                return NotFound(new { message = "Cart item not found" });

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
            await RecalculateCartTotalsAsync(cart);

            return Ok(new { message = "Item removed from cart" });
        }

        // ==========================================
        // DELETE: api/Cart/clear
        // ✅ Clear Cart (زرار Clear Cart)
        // ==========================================
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();

            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.IdUser.HasValue && c.IdUser.Value == userId);

            if (cart == null)
                return NotFound(new { message = "Cart not found" });

            // ✅ FIX: IdCart في CartItem هو int? فلازم HasValue/Value
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
    // DTOs (داخل نفس الملف للتسهيل)
    // =========================
    public class AddToCartDto
    {
        public string ProductApiName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class UpdateCartItemDto
    {
        public int Quantity { get; set; }
        public decimal? Price { get; set; } // اختياري
    }
}
