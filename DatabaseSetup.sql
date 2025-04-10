-- =====================================================================
-- SQL Script to Create Databases and Tables for Product/Transaction App
-- Databases: ProductoDb, TransaccionDb
-- Tables:
--   ProductoDb: Categoria, Producto
--   TransaccionDb: TipoTransaccion, Transaccion
-- Script is designed to be idempotent (run multiple times safely).
-- =====================================================================

-- Ensure execution starts in a known context
USE [master];
GO

-- =============================================
-- Create Databases if they do not exist
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ProductoDb')
BEGIN
  PRINT 'Creating database ProductoDb...';
  CREATE DATABASE ProductoDb;
  PRINT 'Database ProductoDb created.';
END
ELSE
BEGIN
  PRINT 'Database ProductoDb already exists.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TransaccionDb')
BEGIN
  PRINT 'Creating database TransaccionDb...';
  CREATE DATABASE TransaccionDb;
  PRINT 'Database TransaccionDb created.';
END
ELSE
BEGIN
  PRINT 'Database TransaccionDb already exists.';
END
GO

-- =============================================
-- Setup Objects in ProductoDb
-- =============================================
PRINT CHAR(13) + 'Switching to ProductoDb context...';
USE [ProductoDb];
GO

-- Create Categoria table
PRINT 'Checking/Creating table dbo.Categoria...';
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Categoria')
BEGIN
    CREATE TABLE dbo.Categoria (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Nombre NVARCHAR(100) NOT NULL UNIQUE -- Added UNIQUE constraint, common for category names
    );
    PRINT 'Table dbo.Categoria created.';
END
ELSE
BEGIN
    PRINT 'Table dbo.Categoria already exists.';
END
GO

-- Create Producto table
PRINT 'Checking/Creating table dbo.Producto...';
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Producto')
BEGIN
    CREATE TABLE dbo.Producto (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Nombre NVARCHAR(150) NOT NULL,
        Descripcion NVARCHAR(1000) NULL,
        CategoriaId INT NOT NULL,
        Imagen NVARCHAR(500) NULL, -- Storing path or URL typically
        Precio DECIMAL(18, 2) NOT NULL,
        Stock INT NOT NULL DEFAULT 0,

        -- Foreign Key constraint within ProductoDb
        CONSTRAINT FK_Producto_Categoria FOREIGN KEY (CategoriaId) REFERENCES dbo.Categoria(Id)
    );
    PRINT 'Table dbo.Producto created.';
END
ELSE
BEGIN
    PRINT 'Table dbo.Producto already exists.';
END
GO

-- =============================================
-- Setup Objects in TransaccionDb
-- =============================================
PRINT CHAR(13) + 'Switching to TransaccionDb context...';
USE [TransaccionDb];
GO

-- Create TipoTransaccion table
PRINT 'Checking/Creating table dbo.TipoTransaccion...';
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'TipoTransaccion')
BEGIN
    CREATE TABLE dbo.TipoTransaccion (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Tipo NVARCHAR(50) NOT NULL UNIQUE -- e.g., 'Compra', 'Venta' - Should be unique
    );
    PRINT 'Table dbo.TipoTransaccion created.';

    -- Optional: Seed basic transaction types
    PRINT 'Seeding basic transaction types...';
    INSERT INTO dbo.TipoTransaccion (Tipo) VALUES ('Compra'), ('Venta');
    PRINT 'Basic transaction types seeded.';

END
ELSE
BEGIN
    PRINT 'Table dbo.TipoTransaccion already exists.';
END
GO

-- Create Transaccion table
PRINT 'Checking/Creating table dbo.Transaccion...';
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Transaccion')
BEGIN
    CREATE TABLE dbo.Transaccion (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Fecha DATETIME2 NOT NULL DEFAULT GETDATE(),
        TipoTransaccionId INT NOT NULL,
        ProductoId INT NOT NULL, -- NOTE: This links to Producto.Id in ProductoDb. No cross-database FK constraint here.
        Cantidad INT NOT NULL,
        PrecioUnitario DECIMAL(18, 2) NOT NULL,
        PrecioTotal DECIMAL(18, 2) NOT NULL, -- Storing calculated value as requested
        Detalle NVARCHAR(MAX) NULL, -- Using MAX for potentially long details

        -- Foreign Key constraint within TransaccionDb
        CONSTRAINT FK_Transaccion_TipoTransaccion FOREIGN KEY (TipoTransaccionId) REFERENCES dbo.TipoTransaccion(Id)
    );
    PRINT 'Table dbo.Transaccion created.';
END
ELSE
BEGIN
    PRINT 'Table dbo.Transaccion already exists.';
END
GO

PRINT CHAR(13) + 'Database setup script completed successfully.';