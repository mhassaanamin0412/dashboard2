import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Loader2,
  User,
  Mail,
  Briefcase,
  Globe,
  ShoppingBag,
  FolderOpen,
  Tag,
  FileText,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LEAD_STATUSES, PROFESSIONS } from '@/constants/status';
import useClientStore from '@/store/useClientStore';
import toast from 'react-hot-toast';

const urlSchema = z.string().refine(
  (val) => {
    if (!val || val.trim() === '') return true;
    try {
      new URL(val.startsWith('http') ? val : `https://${val}`);
      return true;
    } catch {
      return /^[\w.-]+\.[a-zA-Z]{2,}/.test(val);
    }
  },
  { message: 'Please enter a valid URL' }
);

const editSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  company_name: z.string().optional(),
  profession: z.string().min(1, 'Profession is required'),
  website_url: z.string().optional().or(urlSchema),
  shopify_page: z.string().optional().or(urlSchema),
  portfolio_url: z.string().optional().or(urlSchema),
  country: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  project_type: z.string().optional(),
  project_description: z.string().optional(),
  tags: z.string().optional(),
});

export default function EditLeadModal() {
  const {
    editingClient,
    isEditModalOpen,
    updateClient,
    closeEditModal,
  } = useClientStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editSchema),
  });

  const statusValue = watch('status');

  // Pre-fill form when editingClient changes
  useEffect(() => {
    if (editingClient) {
      reset({
        name: editingClient.name || '',
        email: editingClient.email || '',
        phone: editingClient.phone || '',
        whatsapp: editingClient.whatsapp || '',
        company_name: editingClient.company_name || '',
        profession: editingClient.profession || '',
        website_url: editingClient.website_url || '',
        shopify_page: editingClient.shopify_page || '',
        portfolio_url: editingClient.portfolio_url || '',
        country: editingClient.country || '',
        status: editingClient.status || 'New Lead',
        project_type: editingClient.project_type || '',
        project_description: editingClient.project_description || '',
        tags: editingClient.tags || '',
      });
    }
  }, [editingClient, reset]);

  const onSubmit = async (data) => {
    if (!editingClient) return;

    try {
      const sanitized = {
        ...data,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        company_name: data.company_name?.trim() || null,
        profession: data.profession.trim(),
        website_url: data.website_url?.trim() || null,
        shopify_page: data.shopify_page?.trim() || null,
        portfolio_url: data.portfolio_url?.trim() || null,
        country: data.country?.trim() || null,
        status: data.status,
        project_type: data.project_type?.trim() || null,
        project_description: data.project_description?.trim() || null,
        tags: data.tags?.trim() || null,
      };

      const success = await updateClient(editingClient.id, sanitized);

      if (success) {
        toast.success('Lead updated successfully!');
      } else {
        toast.error('Failed to update lead. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
    }
  };

  if (!isEditModalOpen || !editingClient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Edit Lead</h2>
            <p className="text-sm text-muted-foreground">
              Update client information
            </p>
          </div>
          <button
            onClick={closeEditModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="John Doe"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Profession */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                Profession <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('profession')}
                placeholder="Developer, Designer, Consultant"
                className={errors.profession ? 'border-red-500' : ''}
              />
              {errors.profession && (
                <p className="text-xs text-red-500">{errors.profession.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                value={statusValue || ''}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-red-500">{errors.status.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Company Name</label>
              <Input
                {...register('company_name')}
                placeholder="Acme Inc."
              />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Country</label>
              <Input
                {...register('country')}
                placeholder="United States"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                Website URL
              </label>
              <Input
                {...register('website_url')}
                placeholder="https://example.com"
                className={errors.website_url ? 'border-red-500' : ''}
              />
              {errors.website_url && (
                <p className="text-xs text-red-500">{errors.website_url.message}</p>
              )}
            </div>

            {/* Shopify Page */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                Shopify Page
              </label>
              <Input
                {...register('shopify_page')}
                placeholder="https://store.myshopify.com"
                className={errors.shopify_page ? 'border-red-500' : ''}
              />
              {errors.shopify_page && (
                <p className="text-xs text-red-500">{errors.shopify_page.message}</p>
              )}
            </div>

            {/* Portfolio URL */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                Portfolio URL
              </label>
              <Input
                {...register('portfolio_url')}
                placeholder="https://portfolio.com"
                className={errors.portfolio_url ? 'border-red-500' : ''}
              />
              {errors.portfolio_url && (
                <p className="text-xs text-red-500">{errors.portfolio_url.message}</p>
              )}
            </div>

            {/* Project Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Project Type</label>
              <Input
                {...register('project_type')}
                placeholder="Web app, e-commerce, portfolio"
              />
            </div>

            {/* Project Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Project Description
              </label>
              <Textarea
                {...register('project_description')}
                placeholder="Describe the client's project requirements..."
                rows={3}
                className={errors.project_description ? 'border-red-500' : ''}
              />
              {errors.project_description && (
                <p className="text-xs text-red-500">{errors.project_description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Tags</label>
              <Input
                {...register('tags')}
                placeholder="marketing, design, follow-up"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={closeEditModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
