using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend.DTO;

namespace appnumber2.Templates
{
    public class AuditReportTemplate : IDocument
    {
        private readonly AuditReportDataDto _data;

        public AuditReportTemplate(AuditReportDataDto data)
        {
            _data = data;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                // 1. PAGE HEADER
                page.Header()
                    .Height(50)
                    .Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(_data.Title).Bold().FontSize(18).FontColor(_data.HeaderColor);
                            col.Item().Text($"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}").FontSize(9).FontColor(Colors.Grey.Darken1);
                        });
                    });

                // 2. AUDIT TICKET CARDS & TIMELINE
                page.Content()
                    .PaddingVertical(0.5f, Unit.Centimetre)
                    .Column(col =>
                    {
                        foreach (var ticket in _data.Tickets)
                        {
                            col.Item().PaddingBottom(15).Border(1).BorderColor(Colors.Grey.Lighten2).CornerRadius(5).Padding(10).Column(card =>
                            {
                                card.Item().Row(r =>
                                {
                                    r.RelativeItem().Text($"Ticket #{ticket.TicketId}: {ticket.Title}").Bold().FontSize(12).FontColor(_data.HeaderColor);
                                    r.AutoItem().Text($"Status: {ticket.Status}").Bold().FontColor(Colors.Purple.Darken4);
                                });

                                card.Item().PaddingVertical(4).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);

                                card.Item().Grid(grid =>
                                {
                                    grid.Columns(2);
                                    grid.Item().Text(t => { t.Span("Created By: ").Bold(); t.Span(ticket.CreatedBy ?? "N/A"); });
                                    grid.Item().Text(t => { t.Span("Assigned Agent: ").Bold(); t.Span(ticket.AssignedTo ?? "Unassigned"); });
                                });

                                card.Item().PaddingTop(6).Text("Status Timeline:").Bold().FontSize(9.5f).FontColor(Colors.Grey.Darken2);

                                card.Item().PaddingVertical(3).Background(Colors.Grey.Lighten4).Padding(5).Grid(grid =>
                                {
                                    grid.Columns(3);
                                    grid.Item().Text(t => { t.Span("Waiting: ").Bold().FontSize(8.5f); t.Span(ticket.TimeWaiting ?? "N/A").FontSize(8.5f); });
                                    grid.Item().Text(t => { t.Span("In Progress: ").Bold().FontSize(8.5f); t.Span(ticket.TimeInProgress ?? "N/A").FontSize(8.5f); });
                                    grid.Item().Text(t => { t.Span("Closed: ").Bold().FontSize(8.5f); t.Span(ticket.TimeClosed ?? "N/A").FontSize(8.5f); });
                                });

                                card.Item().PaddingTop(8).Text("Conversation History:").Bold().FontSize(9.5f).FontColor(_data.HeaderColor);

                                if (ticket.ChatMessages != null && ticket.ChatMessages.Count > 0)
                                {
                                    foreach (var msg in ticket.ChatMessages)
                                    {
                                        card.Item().PaddingLeft(5).PaddingTop(2).Row(r =>
                                        {
                                            r.AutoItem().Text("• ").Bold().FontColor(_data.HeaderColor);
                                            r.RelativeItem().Text(msg).FontSize(9);
                                        });
                                    }
                                }
                                else
                                {
                                    card.Item().PaddingLeft(5).Text("• No messages recorded.").Italic().FontSize(9).FontColor(Colors.Grey.Darken1);
                                }
                            });
                        }
                    });

                // 3. PAGE FOOTER
                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
            });
        }
    }
}