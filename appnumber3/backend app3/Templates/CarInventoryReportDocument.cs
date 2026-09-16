using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend_app3.DTOs;

namespace backend_app3.Templates
{
    public class CarInventoryReportDocument : IDocument
    {
        public CarInventoryReportDto Model { get; }

        public CarInventoryReportDocument(CarInventoryReportDto model)
        {
            Model = model;
        }

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(25);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial"));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);
            });
        }

        void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("VANGUARD DRIVE").FontSize(20).Bold().FontColor(Colors.Orange.Medium);
                    column.Item().Text("Vehicle Inventory & Sales Summary Report").FontSize(10).FontColor(Colors.Grey.Medium);
                });

                row.ConstantItem(150).AlignRight().Column(column =>
                {
                    column.Item().Text($"Date: {Model.GeneratedDate:yyyy-MM-dd HH:mm}").Bold();
                });
            });
        }

        void ComposeContent(IContainer container)
        {
            container.PaddingVertical(15).Column(column =>
            {
                column.Spacing(15);

                // Summary KPI Cards
                column.Item().Row(row =>
                {
                    row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                    {
                        c.Item().Text("Available Stock Value").FontSize(8).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"${Model.TotalInventoryValue:N2}").FontSize(13).Bold().FontColor(Colors.Green.Darken2);
                    });

                    row.ConstantItem(10);

                    row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                    {
                        c.Item().Text("Available Vehicles").FontSize(8).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"{Model.TotalAvailableVehicles}").FontSize(13).Bold().FontColor(Colors.Blue.Darken2);
                    });

                    row.ConstantItem(10);

                    row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                    {
                        c.Item().Text("Vehicles Sold").FontSize(8).FontColor(Colors.Grey.Darken1);
                        c.Item().Text($"{Model.TotalSoldVehicles}").FontSize(13).Bold().FontColor(Colors.Orange.Darken2);
                    });
                });

                // Vehicle Inventory Table
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3); // Vehicle (Make + Model)
                        columns.RelativeColumn(1.5f); // Year
                        columns.RelativeColumn(2); // Type / Body
                        columns.RelativeColumn(2); // Condition
                        columns.RelativeColumn(2); // Price
                        columns.RelativeColumn(2); // Status
                    });

                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Vehicle").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Year").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Type").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).Text("Condition").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).AlignRight().Text("Price").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Grey.Darken3).Padding(5).AlignRight().Text("Status").Bold().FontColor(Colors.White);
                    });

                    foreach (var item in Model.Items)
                    {
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"{item.Make} {item.Model}");
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Year.ToString());
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(string.IsNullOrEmpty(item.Type) ? "N/A" : item.Type);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(string.IsNullOrEmpty(item.Condition) ? "N/A" : item.Condition);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text($"${item.Price:N2}");
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).AlignRight().Text(item.IsSold ? "SOLD" : "Available")
                            .FontColor(item.IsSold ? Colors.Red.Medium : Colors.Green.Medium).Bold();
                    }
                });
            });
        }

        void ComposeFooter(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Text("Confidential - Vanguard Drive Vehicle Inventory Document").FontSize(8).Italic().FontColor(Colors.Grey.Medium);
                row.RelativeItem().AlignRight().Text(x =>
                {
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        }
    }
}