-- =============================================================================
-- Store Seed Data - Sample Products for Development/Testing
-- =============================================================================
-- Run this AFTER store-schema-migration.sql
-- Inserts sample products for local development and testing
-- All products use realistic data but are not real TD Synnex listings
-- =============================================================================

-- Sample products for each category
-- First, get category IDs
DO $$
DECLARE
  cat_laptops uuid;
  cat_desktops uuid;
  cat_monitors uuid;
  cat_accessories uuid;
  cat_networking uuid;
  cat_storage uuid;
  cat_peripherals uuid;
  cat_software uuid;
BEGIN
  SELECT id INTO cat_laptops FROM store_categories WHERE slug = 'laptops';
  SELECT id INTO cat_desktops FROM store_categories WHERE slug = 'desktops';
  SELECT id INTO cat_monitors FROM store_categories WHERE slug = 'monitors';
  SELECT id INTO cat_accessories FROM store_categories WHERE slug = 'accessories';
  SELECT id INTO cat_networking FROM store_categories WHERE slug = 'networking';
  SELECT id INTO cat_storage FROM store_categories WHERE slug = 'storage';
  SELECT id INTO cat_peripherals FROM store_categories WHERE slug = 'peripherals';
  SELECT id INTO cat_software FROM store_categories WHERE slug = 'software';

  -- Laptops
  INSERT INTO store_products (sku, manufacturer_part, name, description, short_description, manufacturer, category_id, cost_price, retail_price, msrp, stock_quantity, stock_status, weight_lbs, specs, is_featured, is_active)
  VALUES
    ('SYN-LP-001', 'ThinkPad-E16-G2', 'Lenovo ThinkPad E16 Gen 2 - Intel Core i5, 16GB RAM, 512GB SSD', 'The Lenovo ThinkPad E16 Gen 2 delivers reliable business performance with an Intel Core i5-1345U processor, 16GB DDR5 memory, and a 512GB NVMe SSD. The 16" IPS display provides comfortable viewing for all-day productivity.', 'Business laptop with i5 processor and 16GB RAM', 'Lenovo', cat_laptops, 549.99, 699.99, 799.99, 12, 'in_stock', 4.19, '{"Processor": "Intel Core i5-1345U", "RAM": "16GB DDR5", "Storage": "512GB NVMe SSD", "Display": "16\" FHD IPS", "OS": "Windows 11 Pro", "Battery": "57Wh", "Ports": "2x USB-C, 2x USB-A, HDMI, Ethernet"}', true, true),
    ('SYN-LP-002', 'Latitude-3540', 'Dell Latitude 3540 - Intel Core i7, 16GB RAM, 256GB SSD', 'Dell Latitude 3540 business laptop with 13th Gen Intel Core i7, perfect for professional use. Features a bright 15.6" display and all-day battery life.', 'Professional laptop with i7 and Dell reliability', 'Dell', cat_laptops, 679.99, 849.99, 999.99, 5, 'in_stock', 3.86, '{"Processor": "Intel Core i7-1365U", "RAM": "16GB DDR4", "Storage": "256GB NVMe SSD", "Display": "15.6\" FHD", "OS": "Windows 11 Pro", "Battery": "54Wh"}', true, true),
    ('SYN-LP-003', 'HP-255-G10', 'HP 255 G10 - AMD Ryzen 5, 8GB RAM, 256GB SSD', 'Affordable HP business laptop with AMD Ryzen 5 processor. Great for everyday office tasks, email, and web browsing.', 'Budget-friendly AMD business laptop', 'HP', cat_laptops, 349.99, 449.99, 529.99, 20, 'in_stock', 3.68, '{"Processor": "AMD Ryzen 5 7530U", "RAM": "8GB DDR4", "Storage": "256GB NVMe SSD", "Display": "15.6\" FHD", "OS": "Windows 11 Pro"}', false, true),
    ('SYN-LP-004', 'IdeaPad-3-15', 'Lenovo IdeaPad 3 15 - Intel Core i3, 8GB RAM, 256GB SSD', 'Perfect starter laptop for home and student use. Lightweight design with Intel Core i3 for basic computing needs.', 'Affordable home/student laptop', 'Lenovo', cat_laptops, 279.99, 359.99, 399.99, 8, 'in_stock', 3.53, '{"Processor": "Intel Core i3-1215U", "RAM": "8GB DDR4", "Storage": "256GB SSD", "Display": "15.6\" FHD", "OS": "Windows 11 Home"}', false, true)
  ON CONFLICT (sku) DO NOTHING;

  -- Desktops
  INSERT INTO store_products (sku, manufacturer_part, name, description, short_description, manufacturer, category_id, cost_price, retail_price, msrp, stock_quantity, stock_status, weight_lbs, specs, is_featured, is_active)
  VALUES
    ('SYN-DT-001', 'OptiPlex-3000', 'Dell OptiPlex 3000 SFF - Intel Core i5, 16GB RAM, 512GB SSD', 'Compact small form factor desktop for business environments. Intel Core i5 with 16GB RAM delivers smooth multitasking for office productivity.', 'Compact business desktop with i5', 'Dell', cat_desktops, 499.99, 629.99, 749.99, 7, 'in_stock', 10.36, '{"Processor": "Intel Core i5-12500", "RAM": "16GB DDR4", "Storage": "512GB NVMe SSD", "Form Factor": "Small Form Factor", "OS": "Windows 11 Pro", "Ports": "6x USB-A, 2x USB-C, HDMI, DP"}', true, true),
    ('SYN-DT-002', 'ProDesk-400-G9', 'HP ProDesk 400 G9 SFF - Intel Core i5, 8GB RAM, 256GB SSD', 'HP business desktop with space-saving small form factor design. Reliable and manageable for office deployments.', 'HP business desktop', 'HP', cat_desktops, 419.99, 529.99, 629.99, 3, 'low_stock', 10.58, '{"Processor": "Intel Core i5-12500", "RAM": "8GB DDR4", "Storage": "256GB NVMe SSD", "Form Factor": "Small Form Factor", "OS": "Windows 11 Pro"}', false, true)
  ON CONFLICT (sku) DO NOTHING;

  -- Monitors
  INSERT INTO store_products (sku, manufacturer_part, name, description, short_description, manufacturer, category_id, cost_price, retail_price, msrp, stock_quantity, stock_status, weight_lbs, specs, is_featured, is_active)
  VALUES
    ('SYN-MN-001', 'P2422H', 'Dell P2422H 24" FHD IPS Monitor', 'Professional-grade 24" monitor with IPS panel for accurate colors. USB-C connectivity and adjustable stand included. Ideal for business and productivity use.', '24" professional IPS monitor', 'Dell', cat_monitors, 169.99, 219.99, 249.99, 15, 'in_stock', 13.01, '{"Size": "24\"", "Resolution": "1920x1080 FHD", "Panel": "IPS", "Refresh Rate": "60Hz", "Ports": "HDMI, DisplayPort, USB-C", "Adjustable": "Height, Tilt, Swivel, Pivot"}', false, true),
    ('SYN-MN-002', '27E1N5500E', 'Philips 27" QHD IPS Monitor', 'Sharp 27" Quad HD display for detailed work. IPS panel delivers wide viewing angles and vivid colors.', '27" QHD monitor', 'Philips', cat_monitors, 199.99, 259.99, 299.99, 10, 'in_stock', 11.46, '{"Size": "27\"", "Resolution": "2560x1440 QHD", "Panel": "IPS", "Refresh Rate": "75Hz", "Ports": "HDMI, DisplayPort", "HDR": "HDR10"}', true, true)
  ON CONFLICT (sku) DO NOTHING;

  -- Accessories
  INSERT INTO store_products (sku, manufacturer_part, name, description, short_description, manufacturer, category_id, cost_price, retail_price, msrp, stock_quantity, stock_status, weight_lbs, specs, is_featured, is_active)
  VALUES
    ('SYN-AC-001', 'MK270', 'Logitech MK270 Wireless Keyboard and Mouse Combo', 'Reliable wireless keyboard and mouse combo with long battery life. Plug-and-play USB receiver.', 'Wireless keyboard & mouse combo', 'Logitech', cat_accessories, 19.99, 29.99, 34.99, 30, 'in_stock', 1.60, '{"Type": "Wireless", "Receiver": "USB Nano", "Battery Life": "36 months (keyboard), 12 months (mouse)", "Layout": "Full-size"}', false, true),
    ('SYN-AC-002', 'C920S', 'Logitech C920S HD Pro Webcam', 'Full HD 1080p webcam with privacy shutter, auto-focus, and dual stereo microphones. Perfect for video calls.', 'HD webcam with privacy shutter', 'Logitech', cat_accessories, 49.99, 69.99, 79.99, 18, 'in_stock', 0.56, '{"Resolution": "1080p/30fps", "Focus": "Auto-focus", "Microphone": "Dual stereo", "Privacy": "Built-in shutter", "Mount": "Universal clip"}', false, true)
  ON CONFLICT (sku) DO NOTHING;

  -- Networking
  INSERT INTO store_products (sku, manufacturer_part, name, description, short_description, manufacturer, category_id, cost_price, retail_price, msrp, stock_quantity, stock_status, weight_lbs, specs, is_featured, is_active)
  VALUES
    ('SYN-NW-001', 'Archer-AX21', 'TP-Link Archer AX21 WiFi 6 Router', 'Dual-band WiFi 6 router with speeds up to 1.8 Gbps. Covers up to 2500 sq ft with reliable wireless connectivity.', 'WiFi 6 router for home/office', 'TP-Link', cat_networking, 54.99, 74.99, 89.99, 12, 'in_stock', 1.10, '{"WiFi Standard": "WiFi 6 (802.11ax)", "Speed": "1.8 Gbps", "Bands": "Dual-band", "Coverage": "2500 sq ft", "Ports": "1x Gigabit WAN, 4x Gigabit LAN"}', false, true),
    ('SYN-NW-002', 'SG108', 'TP-Link 8-Port Gigabit Switch', 'Simple plug-and-play 8-port gigabit ethernet switch. Quiet fanless design for desktop use.', '8-port gigabit desktop switch', 'TP-Link', cat_networking, 17.99, 24.99, 29.99, 25, 'in_stock', 0.73, '{"Ports": "8x Gigabit Ethernet", "Speed": "10/100/1000 Mbps", "Design": "Fanless, Desktop", "Management": "Unmanaged"}', false, true)
  ON CONFLICT (sku) DO NOTHING;

  -- Storage
  INSERT INTO store_products (sku, manufacturer_part, name, description, short_description, manufacturer, category_id, cost_price, retail_price, msrp, stock_quantity, stock_status, weight_lbs, specs, is_featured, is_active)
  VALUES
    ('SYN-ST-001', '870-EVO-1TB', 'Samsung 870 EVO 1TB SATA SSD', 'Reliable SATA SSD for upgrading older systems. Sequential read speeds up to 560 MB/s. Great for breathing new life into an aging computer.', '1TB SATA SSD upgrade', 'Samsung', cat_storage, 64.99, 89.99, 109.99, 20, 'in_stock', 0.11, '{"Capacity": "1TB", "Interface": "SATA III (6Gbps)", "Form Factor": "2.5\"", "Read Speed": "560 MB/s", "Write Speed": "530 MB/s", "Endurance": "600 TBW"}', true, true),
    ('SYN-ST-002', 'T7-Shield-1TB', 'Samsung T7 Shield 1TB Portable SSD', 'Rugged portable SSD with USB 3.2 Gen 2 speeds up to 1,050 MB/s. IP65 water and dust resistant.', 'Rugged portable 1TB SSD', 'Samsung', cat_storage, 79.99, 109.99, 129.99, 8, 'in_stock', 0.20, '{"Capacity": "1TB", "Interface": "USB 3.2 Gen 2", "Read Speed": "1,050 MB/s", "Write Speed": "1,000 MB/s", "Durability": "IP65, 3m drop resistant"}', false, true)
  ON CONFLICT (sku) DO NOTHING;

  -- Peripherals
  INSERT INTO store_products (sku, manufacturer_part, name, description, short_description, manufacturer, category_id, cost_price, retail_price, msrp, stock_quantity, stock_status, weight_lbs, specs, is_featured, is_active)
  VALUES
    ('SYN-PR-001', 'HL-L2350DW', 'Brother HL-L2350DW Mono Laser Printer', 'Compact wireless mono laser printer with automatic duplex printing. Ideal for small offices with moderate print volumes.', 'Wireless mono laser printer', 'Brother', cat_peripherals, 89.99, 119.99, 149.99, 6, 'in_stock', 15.60, '{"Type": "Mono Laser", "Speed": "32 ppm", "Duplex": "Automatic", "Connectivity": "WiFi, USB", "Paper Tray": "250 sheets"}', false, true),
    ('SYN-PR-002', 'H390', 'Logitech H390 USB Headset', 'Comfortable USB headset with noise-canceling microphone. In-line audio controls for easy volume and mute.', 'USB headset with mic', 'Logitech', cat_peripherals, 19.99, 29.99, 39.99, 15, 'in_stock', 0.44, '{"Type": "Over-ear USB", "Microphone": "Noise-canceling", "Controls": "In-line volume/mute", "Compatibility": "Windows, Mac, Chrome OS"}', false, true)
  ON CONFLICT (sku) DO NOTHING;

  -- Software
  INSERT INTO store_products (sku, manufacturer_part, name, description, short_description, manufacturer, category_id, cost_price, retail_price, msrp, stock_quantity, stock_status, weight_lbs, specs, is_featured, is_active)
  VALUES
    ('SYN-SW-001', 'M365-Personal', 'Microsoft 365 Personal - 1 Year Subscription', 'Full Microsoft Office suite including Word, Excel, PowerPoint, and Outlook. 1TB OneDrive cloud storage. For 1 person, up to 5 devices.', 'Office 365 Personal 1-year', 'Microsoft', cat_software, 49.99, 69.99, 69.99, 100, 'in_stock', 0.00, '{"License": "1 year subscription", "Users": "1 person", "Devices": "Up to 5", "Storage": "1TB OneDrive", "Apps": "Word, Excel, PowerPoint, Outlook, OneNote"}', false, true),
    ('SYN-SW-002', 'Win11-Pro', 'Windows 11 Pro - Digital License', 'Windows 11 Pro digital license key for professional use. Includes BitLocker, Remote Desktop, and enterprise management features.', 'Windows 11 Pro license', 'Microsoft', cat_software, 129.99, 169.99, 199.99, 50, 'in_stock', 0.00, '{"License": "Perpetual digital license", "Edition": "Professional", "Features": "BitLocker, Remote Desktop, Hyper-V, Group Policy"}', false, true)
  ON CONFLICT (sku) DO NOTHING;

  RAISE NOTICE 'Store seed data inserted successfully. % products across 8 categories.',
    (SELECT count(*) FROM store_products);
END $$;
