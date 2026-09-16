using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using backend_app3.DTOs;
using backend_app3.Models;
using backend_app3.Repositories;
using backend_app3.Templates;

using QuestPDF.Infrastructure;
namespace backend_app3.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SparePartsController : ControllerBase
    {
        private readonly ISparePartRepository _partRepository;

        public SparePartsController(ISparePartRepository partRepository)
        {
            _partRepository = partRepository;
        }

        // GET: api/spareparts?query=brake
        [HttpGet]
        public async Task<IActionResult> GetParts([FromQuery] string? query)
        {
            try
            {
                var parts = await _partRepository.GetPartsAsync(query);

                var response = parts.Select(p => new SparePartResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    PartNumber = p.PartNumber,
                    Category = p.Category,
                    Price = p.Price,
                    QuantityInStock = p.QuantityInStock,
                    SoldQuantity = p.SoldQuantity,
                    CompatibleModels = p.CompatibleModels,
                    ImageUrl = p.ImageUrl,
                    IsSoldOut = p.IsSoldOut
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error querying parts.", details = ex.Message });
            }
        }

        // POST: api/spareparts (Adding parts to inventory - Admin & Inventory)
        [HttpPost]
        [Authorize(Roles = "admin,inventory")]
        public async Task<IActionResult> AddPart([FromBody] CreateSparePartDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var part = new SparePart
                {
                    Name = dto.Name,
                    PartNumber = dto.PartNumber,
                    Category = dto.Category,
                    Price = dto.Price,
                    QuantityInStock = dto.QuantityInStock,
                    SoldQuantity = 0,
                    CompatibleModels = dto.CompatibleModels,
                    ImageUrl = dto.ImageUrl
                };

                await _partRepository.AddAsync(part);
                await _partRepository.SaveChangesAsync();

                return Ok(new { message = "Spare part added to inventory successfully!", partId = part.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST: api/spareparts/buy/{id} (Buying parts - Buyer, Admin, and POS roles)
       [HttpPost("buy/{id}")]
[Authorize(Roles = "Buyer,admin,pos")]
public async Task<IActionResult> BuyPart(int id, [FromBody] BuySparePartDto? dto)
{
    var part = await _partRepository.GetByIdAsync(id);

    if (part == null)
    {
        return NotFound(new { message = "Part not found." });
    }

    int quantityToSell = (dto != null && dto.Quantity > 0) ? dto.Quantity : 1;

    if (part.QuantityInStock < quantityToSell)
    {
        return BadRequest(new { 
            message = $"Insufficient stock. Only {part.QuantityInStock} items remaining." 
        });
    }

    // Deduct stock
    part.QuantityInStock -= quantityToSell;
    part.SoldQuantity += quantityToSell;

    // Create sale record mapping directly to MySQL table structure
    var saleRecord = new SaleRecord
    {
        ItemType = "SparePart",
        ItemId = part.Id,
        Quantity = quantityToSell,
        TotalAmount = part.Price * quantityToSell,
        CustomerName = dto?.CustomerName ?? "N/A",
        CustomerPhone = dto?.CustomerPhone ?? "N/A",
        SaleDate = DateTime.UtcNow
    };

    await _partRepository.AddSaleRecordAsync(saleRecord);
    await _partRepository.SaveChangesAsync();

    // Check low stock threshold
    bool isLowStock = part.QuantityInStock <= 10;
    string? warningMessage = isLowStock
        ? $"ALERT: '{part.Name}' stock is low! Only {part.QuantityInStock} units remaining. Please refil."
        : null;

    return Ok(new { 
        message = $"{quantityToSell} spare part(s) purchased successfully!", 
        saleId = saleRecord.Id,
        partId = id, 
        purchasedQuantity = quantityToSell,
        customerName = saleRecord.CustomerName,
        customerPhone = saleRecord.CustomerPhone,
        remainingStock = part.QuantityInStock,
        totalSold = part.SoldQuantity,
        isLowStock = isLowStock,
        lowStockWarning = warningMessage
    });
}

        // GET: api/spareparts/receipt/{saleId}/preview
        [HttpGet("receipt/{saleId}/preview")]
        public async Task<IActionResult> PreviewReceipt(int saleId)
        {
            try
            {
                QuestPDF.Settings.License = LicenseType.Community;
                var sale = await _partRepository.GetSaleRecordByIdAsync(saleId);
                if (sale == null)
                {
                    return NotFound(new { message = "Sale record not found." });
                }

                var part = await _partRepository.GetByIdAsync(sale.ItemId);
                string itemName = part?.Name ?? "Spare Part";

                var receiptModel = new ReceiptModel
                {
                    ReceiptId = sale.Id,
                    Date = sale.SaleDate,
                    CustomerName = sale.CustomerName,
                    CustomerPhone = sale.CustomerPhone,
                    ItemName = itemName,
                    ItemType = sale.ItemType,
                    Quantity = sale.Quantity,
                    UnitPrice = sale.Quantity > 0 ? sale.TotalAmount / sale.Quantity : sale.TotalAmount
                };

                var document = new ReceiptDocument(receiptModel);
                byte[] pdfBytes = document.GeneratePdf();

                Response.Headers.Append("Content-Disposition", "inline; filename=receipt.pdf");
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating receipt PDF.", details = ex.Message });
            }
        }
        // GET: api/spareparts/report/view
[HttpGet("report/view")]
public async Task<IActionResult> ViewInventoryReport()
{
    try
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var parts = await _partRepository.GetPartsAsync(null);
        var partList = parts.ToList();

        var reportModel = new InventoryReportDto
        {
            GeneratedDate = DateTime.UtcNow,
            TotalPartsCount = partList.Count,
            TotalAvailableParts = partList.Sum(p => p.QuantityInStock),
            TotalSoldParts = partList.Sum(p => p.SoldQuantity),
            TotalInventoryValue = partList.Sum(p => p.Price * p.QuantityInStock),
            Items = partList.Select(p => new InventoryItemDto
            {
                Id = p.Id,
                Name = p.Name,
                PartNumber = p.PartNumber,
                Category = p.Category,
                Price = p.Price,
                QuantityInStock = p.QuantityInStock,
                SoldQuantity = p.SoldQuantity
            }).ToList()
        };

        var document = new InventoryReportDocument(reportModel);
        byte[] pdfBytes = document.GeneratePdf();

        // Setting header to 'inline' causes browsers to preview the PDF instead of downloading
        Response.Headers.Append("Content-Disposition", "inline; filename=inventory_report.pdf");
        
        return File(pdfBytes, "application/pdf");
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Error rendering inventory report PDF.", details = ex.Message });
    }
}
    } 
}