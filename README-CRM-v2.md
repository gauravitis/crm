# CRM v2 - Enhanced Quotation System

This is the enhanced version of the CRM system with updated quotation templates and improved functionality.

## 🚀 What's New in v2

### Enhanced Quotation Templates
- **Standardized Table Structure**: All three company templates now use a consistent 11-column structure
- **New Columns Added**:
  - Make (highlighted in company colors)
  - Discount % (with default 0%)
  - Lead Time (highlighted in company colors, moved to end)
- **Improved Section Ordering**: Terms & Conditions → Bank Details → Signature Section

### Company Templates Updated

#### 1. Chembio Lifesciences (Modern Template)
- **Color Scheme**: Professional Blue (#0066CC)
- **Font**: Calibri
- **Style**: Modern, grid-based design with alternating row colors
- **Features**: Blue header with white text, emphasized lead times

#### 2. Chembio Lifesciences Pvt. Ltd. (Formal Template)
- **Color Scheme**: Dark Navy (#001F3F) with Gold accents (#D4AF37)
- **Font**: Times New Roman
- **Style**: Corporate, formal business styling
- **Features**: Double borders, formal typography, corporate branding

#### 3. Chemlab Synthesis (Technical Template)
- **Color Scheme**: Scientific Green (#2E7D32)
- **Font**: Arial with Consolas for technical data
- **Style**: Technical, data-focused design
- **Features**: Monospace fonts for technical data, scientific styling

### Table Structure (All Templates)
| Column | Width | Description |
|--------|-------|-------------|
| S.No. | 5% | Serial number |
| Cat. No. | 10% | Catalog number |
| Specification | 18% | Product specifications |
| Make | 8% | Manufacturer (highlighted) |
| Pack | 8% | Pack size |
| Qty | 6% | Quantity |
| Unit Rate | 10% | Price per unit |
| Discount % | 8% | Discount percentage |
| GST % | 7% | GST percentage |
| Lead Time | 9% | Delivery time (highlighted) |
| Amount | 11% | Total amount |

## 🔧 Technical Improvements

### New Files Added
- `frontend/src/utils/quotationTemplates.ts` - Enhanced template system
- `frontend/src/utils/companyDefaults.ts` - Company configuration defaults
- `frontend/src/utils/templateUtils.ts` - Template utility functions
- `frontend/src/utils/templateCustomization.ts` - Template customization options
- `frontend/src/utils/templateExtensions.ts` - Template extensions

### Enhanced Features
- **Company Seal Integration**: All templates now support company seal images
- **Responsive Design**: Tables adapt to different content lengths
- **Error Handling**: Robust error handling with fallback options
- **Default Values**: Smart defaults for missing data
- **Professional Styling**: Enhanced typography and spacing

### Testing & Documentation
- Comprehensive test suites for all templates
- User acceptance testing samples
- Visual regression testing
- Detailed documentation and troubleshooting guides

## 🏗️ Migration Features

### Supabase Integration
- Complete migration to Supabase backend
- Enhanced authentication system
- Improved data management
- Real-time synchronization

### Database Schema
- Optimized database structure
- Better data relationships
- Enhanced performance

## 📋 Section Ordering (Fixed)

The document sections now follow the correct professional order:

1. **Header** - Company branding and information
2. **Title** - Quotation reference and date
3. **Client Details** - Bill to information
4. **Items Table** - Product details with new structure
5. **Terms & Conditions** - Payment and delivery terms
6. **Bank Details** - Banking information for payments
7. **Signature Section** - Company seal and authorized signatory (last)

## 🎨 Visual Enhancements

- **Modern Color Schemes**: Each company has its unique professional color palette
- **Enhanced Typography**: Improved font choices and sizing
- **Better Spacing**: Optimized margins and padding
- **Professional Borders**: Clean, consistent border styling
- **Highlighted Elements**: Important fields like Make and Lead Time are emphasized

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/gauravitis/CRM-v2.git
   ```

2. Install dependencies:
   ```bash
   cd CRM-v2
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Key Changes from v1

- ✅ Standardized 11-column table structure across all templates
- ✅ Added Make, Discount %, and Lead Time columns
- ✅ Fixed section ordering (Bank Details before Signature)
- ✅ Enhanced company-specific styling
- ✅ Improved error handling and fallbacks
- ✅ Added comprehensive testing suite
- ✅ Integrated Supabase backend
- ✅ Enhanced documentation

## 🔗 Repository Links

- **Original CRM**: https://github.com/gauravitis/crm
- **CRM v2 (This repo)**: https://github.com/gauravitis/CRM-v2

---

*This version maintains backward compatibility while providing enhanced features and improved user experience.*