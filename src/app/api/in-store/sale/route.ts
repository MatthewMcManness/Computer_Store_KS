import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/supabase-auth';
import {
  getActiveSale,
  getAvailableSales,
  setActiveSale,
  getAvailableSalesAdmin,
} from '@/lib/gallery';
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
} from '@/lib/supabase';
import { AVAILABLE_SALES } from '@/types/gallery';
import type { SaleType } from '@/types/gallery';

// GET /api/in-store/sale - Get current sale setting
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      // Fallback to static config if Supabase not configured
      return NextResponse.json({
        success: true,
        data: {
          currentSale: 'none',
          saleConfig: AVAILABLE_SALES[0],
          availableSales: AVAILABLE_SALES,
        },
      });
    }

    const activeSale = await getActiveSale();
    const availableSales = await getAvailableSales();

    const currentSale = activeSale?.sale_type || 'none';
    const saleConfig = availableSales.find(s => s.sale_type === currentSale)
      || availableSales.find(s => s.sale_type === 'none')
      || { sale_type: 'none', name: 'No Sale', discount_percent: 0, applies_to: ['refurbished'], is_active: true, id: '', created_at: '' };

    // Convert to legacy format for backward compatibility
    const legacyAvailableSales = availableSales.map(s => ({
      type: s.sale_type as SaleType,
      name: s.name,
      discount: s.discount_percent,
    }));

    return NextResponse.json({
      success: true,
      data: {
        currentSale,
        saleConfig: {
          type: saleConfig.sale_type,
          name: saleConfig.name,
          discount: saleConfig.discount_percent,
        },
        availableSales: legacyAvailableSales.length > 0 ? legacyAvailableSales : AVAILABLE_SALES,
      },
    });
  } catch (error) {
    console.error('Error loading sale setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load sale setting' },
      { status: 500 }
    );
  }
}

// POST /api/in-store/sale - Update global sale setting
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database admin not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { saleType } = body as { saleType: SaleType };

    // Validate sale type exists in database
    const availableSales = await getAvailableSalesAdmin();
    const saleConfig = availableSales.find(s => s.sale_type === saleType);

    if (!saleConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid sale type' },
        { status: 400 }
      );
    }

    // Set the active sale
    const updatedSale = await setActiveSale(saleType);

    if (!updatedSale) {
      return NextResponse.json(
        { success: false, error: 'Failed to set active sale' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        currentSale: saleType,
        saleConfig: {
          type: updatedSale.sale_type,
          name: updatedSale.name,
          discount: updatedSale.discount_percent,
        },
      },
      message: saleType === 'none'
        ? 'Sale removed from refurbished computers'
        : `${updatedSale.name} applied to refurbished computers`,
    });
  } catch (error) {
    console.error('Error updating sale setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sale setting' },
      { status: 500 }
    );
  }
}
