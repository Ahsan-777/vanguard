// using Microsoft.AspNetCore.Mvc;
// using QuestPDF.Fluent;
// using QuestPDF.Infrastructure;
// using backend_app3.Templates;
// using Microsoft.EntityFrameworkCore;
// using backend_app3.Data;
// using backend_app3.DTOs;
// using backend_app3.Models;
// using Microsoft.AspNetCore.Authorization;

// namespace backend_app3.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class CarsController : ControllerBase
//     {
//         private readonly AppDbContext _context;

//         public CarsController(AppDbContext context)
//         {
//             _context = context;
//         }

//         [HttpGet]
//         public async Task<ActionResult<IEnumerable<CarResponseDto>>> GetCars()
//         {
//             var cars = await _context.Cars
//                 .Select(c => new CarResponseDto
//                 {
//                     Id = c.Id,
//                     Make = c.Make,
//                     Model = c.Model,
//                     Year = c.Year,
//                     Price = c.Price,
//                     Mileage = c.Mileage,
//                     Color = c.Color,
//                     EngineSize = c.EngineSize,
//                     Transmission = c.Transmission,
//                     ImageUrl = c.ImageUrl,
//                     IsSold = c.IsSold,
//                     Type = c.Type,
//                     Condition = c.Condition
//                 })
//                 .ToListAsync();

//             return Ok(cars);
//         }

//         // POST: api/cars
//         [HttpPost]
//         public async Task<IActionResult> CreateCar([FromBody] CreateCarDto dto)
//         {
//             if (!ModelState.IsValid)
//             {
//                 return BadRequest(ModelState);
//             }

//             var car = new Car
//             {
//                 Make = dto.Make,
//                 Model = dto.Model,
//                 Year = dto.Year,
//                 Price = dto.Price,
//                 Mileage = dto.Mileage,
//                 Color = dto.Color,
//                 EngineSize = dto.EngineSize,
//                 Transmission = dto.Transmission,
//                 ImageUrl = dto.ImageUrl,
//                 Type = dto.Type,
//                 Condition = dto.Condition,
//                 IsSold = false
//             };

//             await _context.Cars.AddAsync(car);
//             await _context.SaveChangesAsync();

//             return Ok(new { message = "Vehicle added successfully!", id = car.Id });
//         }

//         [HttpPost("buy/{id}")]
//         [Authorize]
//         public async Task<IActionResult> BuyCar(int id, [FromBody] BuyCarRequest request)
//         {
//             if (string.IsNullOrWhiteSpace(request.CustomerName) || string.IsNullOrWhiteSpace(request.CustomerPhone))
//             {
//                 return BadRequest(new { message = "Customer name and phone number are required." });
//             }

//             var car = await _context.Cars.FindAsync(id);

//             if (car == null)
//             {
//                 return NotFound(new { message = "Vehicle not found." });
//             }

//             if (car.IsSold)
//             {
//                 return BadRequest(new { message = "Vehicle has already been sold." });
//             }

//             // Mark vehicle as sold
//             car.IsSold = true;

//             // Record sale in SalesRecords table
//             var saleRecord = new SaleRecord
//             {
//                 ItemType = "Car",
//                 ItemId = car.Id,
//                 Quantity = 1,
//                 TotalAmount = car.Price,
//                 CustomerName = request.CustomerName.Trim(),
//                 CustomerPhone = request.CustomerPhone.Trim(),
//                 SaleDate = DateTime.UtcNow
//             };

//             await _context.SalesRecords.AddAsync(saleRecord);
//             await _context.SaveChangesAsync();

//             return Ok(new
//             {
//                 message = $"{car.Make} {car.Model} sold successfully!",
//                 saleId = saleRecord.Id,
//                 carId = car.Id,
//                 customerName = saleRecord.CustomerName,
//                 customerPhone = saleRecord.CustomerPhone,
//                 totalAmount = saleRecord.TotalAmount
//             });
//         }

//         // GET: api/cars/receipt/{saleId}/preview
//         [HttpGet("receipt/{saleId}/preview")]
//         public async Task<IActionResult> PreviewCarReceipt(int saleId)
//         {
//             try
//             {
//                 QuestPDF.Settings.License = LicenseType.Community;

//                 var sale = await _context.SalesRecords.FindAsync(saleId);
//                 if (sale == null)
//                 {
//                     return NotFound(new { message = "Vehicle sale record not found." });
//                 }

//                 var car = await _context.Cars.FindAsync(sale.ItemId);

//                 var receiptModel = new CarReceiptDto
//                 {
//                     ReceiptId = sale.Id,
//                     SaleDate = sale.SaleDate,
//                     CustomerName = sale.CustomerName,
//                     CustomerPhone = sale.CustomerPhone,
//                     VehicleName = car != null ? $"{car.Make} {car.Model}" : "Vehicle",
//                     Year = car?.Year ?? 0,
//                     Price = sale.TotalAmount
//                 };

//                 var document = new CarReceiptDocument(receiptModel);
//                 byte[] pdfBytes = document.GeneratePdf();

//                 Response.Headers.Append("Content-Disposition", "inline; filename=car_receipt.pdf");
//                 return File(pdfBytes, "application/pdf");
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "Error generating car receipt PDF.", details = ex.Message });
//             }
//         }

//         // GET: api/cars/report/view
//         [HttpGet("report/Carview")]
//         public async Task<IActionResult> ViewCarInventoryReport()
//         {
//             try
//             {
//                 QuestPDF.Settings.License = LicenseType.Community;

//                 var cars = await _context.Cars.ToListAsync();

//                 var reportModel = new CarInventoryReportDto
//                 {
//                     GeneratedDate = DateTime.UtcNow,
//                     TotalVehiclesCount = cars.Count,
//                     TotalAvailableVehicles = cars.Count(c => !c.IsSold),
//                     TotalSoldVehicles = cars.Count(c => c.IsSold),
//                     TotalInventoryValue = cars.Where(c => !c.IsSold).Sum(c => c.Price),
//                     TotalSalesValue = cars.Where(c => c.IsSold).Sum(c => c.Price),
//                     Items = cars.Select(c => new CarInventoryItemDto
//                     {
//                         Id = c.Id,
//                         Make = c.Make,
//                         Model = c.Model,
//                         Year = c.Year,
//                         Price = c.Price,
//                         Condition = c.Condition,
//                         Type = c.Type,
//                         IsSold = c.IsSold
//                     }).ToList()
//                 };

//                 var document = new CarInventoryReportDocument(reportModel);
//                 byte[] pdfBytes = document.GeneratePdf();

//                 Response.Headers.Append("Content-Disposition", "inline; filename=car_inventory_report.pdf");
//                 return File(pdfBytes, "application/pdf");
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "Error generating car inventory report PDF.", details = ex.Message });
//             }
//         }
//     }
// }
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using backend_app3.Templates;
using Microsoft.EntityFrameworkCore;
using backend_app3.Data;
using backend_app3.DTOs;
using backend_app3.Models;
using Microsoft.AspNetCore.Authorization;
using FirebaseAdmin.Messaging;

namespace backend_app3.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CarsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CarResponseDto>>> GetCars()
        {
            var cars = await _context.Cars
                .Select(c => new CarResponseDto
                {
                    Id = c.Id,
                    Make = c.Make,
                    Model = c.Model,
                    Year = c.Year,
                    Price = c.Price,
                    Mileage = c.Mileage,
                    Color = c.Color,
                    EngineSize = c.EngineSize,
                    Transmission = c.Transmission,
                    ImageUrl = c.ImageUrl,
                    IsSold = c.IsSold,
                    Type = c.Type,
                    Condition = c.Condition
                })
                .ToListAsync();

            return Ok(cars);
        }

        // POST: api/cars
        [HttpPost]
        public async Task<IActionResult> CreateCar([FromBody] CreateCarDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var car = new Car
            {
                Make = dto.Make,
                Model = dto.Model,
                Year = dto.Year,
                Price = dto.Price,
                Mileage = dto.Mileage,
                Color = dto.Color,
                EngineSize = dto.EngineSize,
                Transmission = dto.Transmission,
                ImageUrl = dto.ImageUrl,
                Type = dto.Type,
                Condition = dto.Condition,
                IsSold = false
            };

            await _context.Cars.AddAsync(car);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Vehicle added successfully!", id = car.Id });
        }

        [HttpPost("buy/{id}")]
        [Authorize]
        public async Task<IActionResult> BuyCar(int id, [FromBody] BuyCarRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CustomerName) || string.IsNullOrWhiteSpace(request.CustomerPhone))
            {
                return BadRequest(new { message = "Customer name and phone number are required." });
            }

            var car = await _context.Cars.FindAsync(id);

            if (car == null)
            {
                return NotFound(new { message = "Vehicle not found." });
            }

            if (car.IsSold)
            {
                return BadRequest(new { message = "Vehicle has already been sold." });
            }

            // Mark vehicle as sold
            car.IsSold = true;

            // Record sale in SalesRecords table
            var saleRecord = new SaleRecord
            {
                ItemType = "Car",
                ItemId = car.Id,
                Quantity = 1,
                TotalAmount = car.Price,
                CustomerName = request.CustomerName.Trim(),
                CustomerPhone = request.CustomerPhone.Trim(),
                SaleDate = DateTime.UtcNow
            };

            await _context.SalesRecords.AddAsync(saleRecord);
            await _context.SaveChangesAsync();

            // =====================================================
            // FIREBASE PUSH NOTIFICATION TO ADMINS
            // =====================================================
          // =====================================================
// FIREBASE PUSH NOTIFICATION TO ADMINS
// =====================================================
try
{
    var adminTokens = await _context.Users
        .Where(u => u.Role.ToLower() == "admin" && !string.IsNullOrEmpty(u.FcmToken))
        .Select(u => u.FcmToken!)
        .ToListAsync();

    if (adminTokens.Any())
    {
        var messages = adminTokens.Select(token => new Message()
        {
            Token = token,
            Notification = new Notification()
            {
                Title = "🚗 New Car Sold!",
                Body = $"{car.Make} {car.Model} ({car.Year}) was bought by {saleRecord.CustomerName} for ${saleRecord.TotalAmount:N0}!"
            },
            Data = new Dictionary<string, string>()
            {
                { "type", "CAR_SOLD" },
                { "carId", car.Id.ToString() },
                { "saleId", saleRecord.Id.ToString() }
            }
        }).ToList();

        await FirebaseMessaging.DefaultInstance.SendEachAsync(messages);
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[FCM NOTIFICATION ERROR]: {ex.Message}");
}
            return Ok(new
            {
                message = $"{car.Make} {car.Model} sold successfully!",
                saleId = saleRecord.Id,
                carId = car.Id,
                customerName = saleRecord.CustomerName,
                customerPhone = saleRecord.CustomerPhone,
                totalAmount = saleRecord.TotalAmount
            });
        }

        // GET: api/cars/receipt/{saleId}/preview
        [HttpGet("receipt/{saleId}/preview")]
        public async Task<IActionResult> PreviewCarReceipt(int saleId)
        {
            try
            {
                QuestPDF.Settings.License = LicenseType.Community;

                var sale = await _context.SalesRecords.FindAsync(saleId);
                if (sale == null)
                {
                    return NotFound(new { message = "Vehicle sale record not found." });
                }

                var car = await _context.Cars.FindAsync(sale.ItemId);

                var receiptModel = new CarReceiptDto
                {
                    ReceiptId = sale.Id,
                    SaleDate = sale.SaleDate,
                    CustomerName = sale.CustomerName,
                    CustomerPhone = sale.CustomerPhone,
                    VehicleName = car != null ? $"{car.Make} {car.Model}" : "Vehicle",
                    Year = car?.Year ?? 0,
                    Price = sale.TotalAmount
                };

                var document = new CarReceiptDocument(receiptModel);
                byte[] pdfBytes = document.GeneratePdf();

                Response.Headers.Append("Content-Disposition", "inline; filename=car_receipt.pdf");
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating car receipt PDF.", details = ex.Message });
            }
        }

        // GET: api/cars/report/view
        [HttpGet("report/Carview")]
        public async Task<IActionResult> ViewCarInventoryReport()
        {
            try
            {
                QuestPDF.Settings.License = LicenseType.Community;

                var cars = await _context.Cars.ToListAsync();

                var reportModel = new CarInventoryReportDto
                {
                    GeneratedDate = DateTime.UtcNow,
                    TotalVehiclesCount = cars.Count,
                    TotalAvailableVehicles = cars.Count(c => !c.IsSold),
                    TotalSoldVehicles = cars.Count(c => c.IsSold),
                    TotalInventoryValue = cars.Where(c => !c.IsSold).Sum(c => c.Price),
                    TotalSalesValue = cars.Where(c => c.IsSold).Sum(c => c.Price),
                    Items = cars.Select(c => new CarInventoryItemDto
                    {
                        Id = c.Id,
                        Make = c.Make,
                        Model = c.Model,
                        Year = c.Year,
                        Price = c.Price,
                        Condition = c.Condition,
                        Type = c.Type,
                        IsSold = c.IsSold
                    }).ToList()
                };

                var document = new CarInventoryReportDocument(reportModel);
                byte[] pdfBytes = document.GeneratePdf();

                Response.Headers.Append("Content-Disposition", "inline; filename=car_inventory_report.pdf");
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating car inventory report PDF.", details = ex.Message });
            }
        }
    }
}