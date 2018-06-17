using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using UI.Models;

namespace UI
{
    public class EntityDbContext : DbContext
    {
        private IConfiguration _configuration;

        public EntityDbContext()
        {
        }

        public EntityDbContext(DbContextOptions<EntityDbContext> options, IConfiguration configuration)
            : base(options)
        {
            _configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");

                optionsBuilder.UseSqlServer(connectionString);
            }
        }

        //entities
        public DbSet<UserTimer> UserTimers { get; set; }
    }
}
