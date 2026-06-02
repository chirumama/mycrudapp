using System.ComponentModel.DataAnnotations;
namespace CRUDapp.Models
{
    public class Item
    {
        public int Id { get; set; }

        [MaxLength(100)]
        public string? Title { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? Tag { get; set; }

        [MaxLength(2000)]
        public string? ImageUrl { get; set; }

        [MaxLength(2000)]
        public string? Link { get; set; }
    }
}