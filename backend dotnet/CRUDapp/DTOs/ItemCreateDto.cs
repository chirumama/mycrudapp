namespace CRUDapp.DTOs
{
    public class ItemCreateDto
    {
        public string? Title { get; set; }

        public string? Description { get; set; }

        public string? Tag { get; set; }

        public string? ImageUrl { get; set; }

        public string? Link { get; set; }
    }
}