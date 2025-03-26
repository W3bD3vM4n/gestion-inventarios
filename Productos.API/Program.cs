using Microsoft.EntityFrameworkCore;
using Productos.Data.Models;
using Productos.Services.Services;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Cross-Origin Resource Sharing (CORS) mechanism in the server
builder.Services.AddCors(options =>
{
    options.AddPolicy("NuevaPolitica", policy =>
    {
        policy.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// Get the connection string from the configuration
var connectionString = builder.Configuration.GetConnectionString("ProductosConnection");

// Configure the DbContext
builder.Services.AddDbContext<ProductoDbContext>(options => options
    .UseLazyLoadingProxies()
    .UseSqlServer(connectionString)
);


// Register of 'Services' with the Dependency Injection container
builder.Services.AddTransient<ProductoService>();

// Ignore JSON circular references
builder.Services.AddControllers().AddJsonOptions(x => x.JsonSerializerOptions
    .ReferenceHandler = ReferenceHandler.IgnoreCycles);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("NuevaPolitica");

app.UseAuthorization();

app.MapControllers();

app.Run();
