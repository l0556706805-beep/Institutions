using EducationOrdersAPI.Models;
using System;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
namespace EducationOrdersAPI.Data
{
    public static class SeedData
    {
        public static void Initialize(InstitutionsContext ctx)
        {
            ctx.Database.Migrate();

            if (!ctx.Institutions.Any())
            {
                ctx.Institutions.AddRange(
                    new Institution { Name = "תלמוד תורה אור שלום", Address = "רח׳ החינוך 12, ירושלים", Phone = "02-5551234", ContactName = "ישראל כהן" },
                    new Institution { Name = "בית ספר ממ״ד נר תמיד", Address = "רח׳ מבוא התקווה 8, בני ברק", Phone = "03-7774567", ContactName = "דבורה לוי" },
                    new Institution { Name = "גן ילדים צהרון עתיד", Address = "רח׳ הילדות 3, מודיעין", Phone = "08-6667890", ContactName = "שרה פרידמן" }
                );
                ctx.SaveChanges();
            }

            if (!ctx.Categories.Any())
            {
                ctx.Categories.AddRange(
                    new Category { Name = "טואלטיקה", Description = "מוצרי ניקיון והיגיינה" },
                    new Category { Name = "חד פעמי", Description = "מוצרים חד פעמיים לשימוש יומיומי" },
                    new Category { Name = "ממתקים", Description = "חטיפים והפתעות לילדים" },
                    new Category { Name = "משרד", Description = "ציוד משרדי למוסד" },
                    new Category { Name = "תחזוקה", Description = "חומרי ניקיון ותחזוקה" }
                );
                ctx.SaveChanges();
            }

            if (!ctx.Products.Any())
            {
                // Add example products (IDs assume categories inserted)
                var cat1 = ctx.Categories.First(c => c.Name.Contains("טואלטיקה"));
                var cat2 = ctx.Categories.First(c => c.Name.Contains("חד פעמי"));
                var cat3 = ctx.Categories.First(c => c.Name.Contains("ממתקים"));
                var cat4 = ctx.Categories.First(c => c.Name.Contains("משרד"));
                var cat5 = ctx.Categories.First(c => c.Name.Contains("תחזוקה"));

                ctx.Products.AddRange(
                    new Product { CategoryId = cat1.Id, Name = "נייר טואלט 32 יח׳", Description = "אריזה משפחתית", Price = 18.90m, Unit = "חבילה" },
                    new Product { CategoryId = cat1.Id, Name = "סבון ידיים 4 ליטר", Description = "גלון – ריח לבנדר", Price = 24.50m, Unit = "גלון" },
                    new Product { CategoryId = cat2.Id, Name = "צלחות חד פעמי 50 יח׳", Description = "קוטר 23 ס״מ", Price = 6.90m, Unit = "חבילה" },
                    new Product { CategoryId = cat2.Id, Name = "כוסות פלסטיק 100 יח׳", Description = "לבן, 200 מ״ל", Price = 4.50m, Unit = "חבילה" },
                    new Product { CategoryId = cat3.Id, Name = "מארז במבה 50 יח׳", Description = "חטיף לילדים", Price = 32.00m, Unit = "מארז" },
                    new Product { CategoryId = cat4.Id, Name = "טושים צבעוניים", Description = "12 יח׳ איכותיים", Price = 9.90m, Unit = "קופסא" },
                    new Product { CategoryId = cat5.Id, Name = "אקונומיקה 4 ליטר", Description = "חומר ניקוי למוסדות", Price = 9.90m, Unit = "גלון" }
                );
                ctx.SaveChanges();
            }
        }
    }
}
