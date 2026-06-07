type Variant = 'active' | 'inactive' | 'expired' | 'pending' | 'suspended' | 'completed' | 'failed' | 'refunded';

const variantMap: Record<Variant, string> = {
  active: 'badge-active',
  inactive: 'badge-inactive',
  expired: 'badge-expired',
  pending: 'badge-pending',
  suspended: 'badge-suspended',
  completed: 'badge-active',
  failed: 'badge-expired',
  refunded: 'badge-inactive',
};

interface Props {
  variant: Variant;
  label?: string;
}

export default function Badge({ variant, label }: Props) {
  return (
    <span className={variantMap[variant] || 'badge-inactive'}>
      {label || variant.charAt(0).toUpperCase() + variant.slice(1)}
    </span>
  );
}
