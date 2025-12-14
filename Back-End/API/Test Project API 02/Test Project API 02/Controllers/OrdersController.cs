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
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        // ============= Helpers =============
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

        private static void RecalculateCartTotals(Cart cart)
        {
            cart.TotalProducts = cart.CartItems.Sum(i => i.Quantity);
            cart.TotalPrice = cart.CartItems.Sum(i => i.Quantity * i.Price);
        }

        private async Task<Cart?> GetLatestUserCartAsync(int userId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                .Where(c => c.IdUser == userId)
                .OrderByDescending(c => c.IdCart)
                .FirstOrDefaultAsync();
        }

        // ======================================
        // POST: api/Orders/checkout
        // يحول السلة الحالية لـ Order
        // ويعمل Cart جديدة فاضية للمستخدم
        // ======================================
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
        {
            if (dto.PaymentMethodId <= 0)
                return BadRequest(new { message = "PaymentMethodId is required" });

            var userId = GetUserId();

            // تأكد Payment Method موجودة
            var paymentExists = await _context.PaymentMethods
                .AnyAsync(p => p.IdPaymentMethod == dto.PaymentMethodId);

            if (!paymentExists)
                return BadRequest(new { message = "Invalid payment method" });

            // هات أحدث cart للمستخدم
            var cart = await GetLatestUserCartAsync(userId);

            if (cart == null)
                return BadRequest(new { message = "Cart not found" });

            if (cart.CartItems == null || cart.CartItems.Count == 0)
                return BadRequest(new { message = "Cart is empty" });

            // احسب الإجمالي من الداتابيز (server-side)
            RecalculateCartTotals(cart);

            // Transaction عشان الطلب + الكارت الجديدة يبقوا مع بعض
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                // أنشئ Order مربوط بالسلة الحالية
                var order = new Order
                {
                    IdUser = userId,
                    IdCart = cart.IdCart,
                    IdPaymentMethod = dto.PaymentMethodId,
                    TotalAmount = cart.TotalPrice
                    // CreateAtOrder هيتحط تلقائي من DB default
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // اعمل Cart جديدة فاضية للمستخدم (عشان السلة القديمة تبقى سجل للأوردر)
                var newCart = new Cart
                {
                    IdUser = userId,
                    TotalProducts = 0,
                    TotalPrice = 0
                };

                _context.Carts.Add(newCart);
                await _context.SaveChangesAsync();

                await tx.CommitAsync();

                return Ok(new
                {
                    message = "Checkout completed successfully",
                    orderId = order.IdOrder,
                    totalAmount = order.TotalAmount,
                    oldCartId = cart.IdCart,
                    newCartId = newCart.IdCart,
                    paymentMethodId = order.IdPaymentMethod
                });
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // ======================================
        // GET: api/Orders/my
        // عرض أوردرات المستخدم
        // ======================================
        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetUserId();

            var orders = await _context.Orders
                .Where(o => o.IdUser == userId)
                .OrderByDescending(o => o.CreateAtOrder)
                .Select(o => new
                {
                    o.IdOrder,
                    o.CreateAtOrder,
                    o.TotalAmount,
                    o.IdPaymentMethod,
                    o.IdCart
                })
                .ToListAsync();

            return Ok(new
            {
                count = orders.Count,
                orders
            });
        }

        // ======================================
        // GET: api/Orders/{orderId}
        // تفاصيل أوردر واحد + عناصره (من CartItems)
        // ======================================
        [HttpGet("{orderId:int}")]
        public async Task<IActionResult> GetOrderDetails(int orderId)
        {
            var userId = GetUserId();

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.IdOrder == orderId && o.IdUser == userId);

            if (order == null)
                return NotFound(new { message = "Order not found" });

            var cartItems = await _context.CartItems
                .Where(i => i.IdCart == order.IdCart)
                .Select(i => new
                {
                    i.IdCartItem,
                    i.ProductApiName,
                    i.Price,
                    i.Quantity,
                    lineTotal = i.Price * i.Quantity
                })
                .ToListAsync();

            return Ok(new
            {
                orderId = order.IdOrder,
                order.CreateAtOrder,
                order.TotalAmount,
                order.IdPaymentMethod,
                cartId = order.IdCart,
                itemsCount = cartItems.Count,   
                items = cartItems
            });
        }
    }
}
