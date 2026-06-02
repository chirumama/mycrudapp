using CRUDapp.Data;
using CRUDapp.DTOs;
using CRUDapp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRUDapp.Controllers
{
    [ApiController]
    [Route("items")]
    public class ItemsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ItemsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Item>>> GetItems()
        {
            return await _db.Items.ToListAsync();
        }


        [HttpPost]
        public async Task<ActionResult<Item>> CreateItem(ItemCreateDto dto)
        {
            var item = new Item
            {
                Title = dto.Title,
                Description = dto.Description,
                Tag = dto.Tag,
                ImageUrl = dto.ImageUrl,
                Link = dto.Link
            };

            _db.Items.Add(item);
            await _db.SaveChangesAsync();

            return item;
        }


        [HttpPut("{id}")]
        public async Task<ActionResult<Item>> UpdateItem(int id, ItemCreateDto dto)
        {
            var item = await _db.Items.FindAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            item.Title = dto.Title;
            item.Description = dto.Description;
            item.Tag = dto.Tag;
            item.ImageUrl = dto.ImageUrl;
            item.Link = dto.Link;

            await _db.SaveChangesAsync();

            return item;
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _db.Items.FindAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            _db.Items.Remove(item);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Item deleted" });
        }
    }
}