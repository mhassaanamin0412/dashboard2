import Papa from 'papaparse';
import { format } from 'date-fns';

export const exportToCSV = (data, filename = 'leads-export') => {
  if (!data || data.length === 0) {
    return false;
  }

  // Map data to export format
  const exportData = data.map((lead) => ({
    Name: lead.name || '',
    Email: lead.email || '',
    Phone: lead.phone || '',
    WhatsApp: lead.whatsapp || '',
    'Company Name': lead.company_name || '',
    Profession: lead.profession || '',
    Country: lead.country || '',
    'Project Type': lead.project_type || '',
    'Project Description': lead.project_description || '',
    Tags: lead.tags || '',
    'Website URL': lead.website_url || '',
    'Shopify Page': lead.shopify_page || '',
    'Portfolio URL': lead.portfolio_url || '',
    Status: lead.status || '',
    'Created At': lead.created_at ? format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm:ss') : '',
    'Updated At': lead.updated_at ? format(new Date(lead.updated_at), 'yyyy-MM-dd HH:mm:ss') : '',
  }));

  const csv = Papa.unparse(exportData, {
    header: true,
    quotes: true,
  });

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  return true;
};
